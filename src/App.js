import 'regenerator-runtime/runtime'
import React from 'react'
import {login, logout} from './utils'
// import './global.css'
import {Stack} from '@fluentui/react/lib/Stack';
import {DefaultPalette} from '@fluentui/react/lib/Styling';
import getConfig from './config'
import {Persona, PersonaSize, PrimaryButton, Spinner, Text, TextField, Toggle} from "@fluentui/react";
import {TestImages} from "@fluentui/example-data";
import Big from 'big.js';

const {networkId} = getConfig(process.env.NODE_ENV || 'development')
// Styles definition
const stackStyles = {
  root: {
    background: DefaultPalette.blue,
  },
};
const stackItemStyles = {
  root: {
    background: DefaultPalette.themePrimary,
    color: DefaultPalette.white,
    padding: 5,
  },
};
// Tokens definition
const containerStackTokens = {childrenGap: 25};
const verticalGapStackTokens = {
  childrenGap: 10,
  padding: 10,
};
const itemAlignmentsStackTokens = {
  childrenGap: 5,
  padding: 10,
};
const clickableStackTokens = {
  padding: 10,
};

const tokens = {
  sectionStack: {
    childrenGap: 10,
  },
  headingStack: {
    childrenGap: 5,
  },
};

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

export default function App() {
  // use React Hooks to store greeting in component state
  const [greeting, set_greeting] = React.useState(null)
  const [likeMs, toggleLikeMs] = React.useState(true)
  const [message, setMessage] = React.useState("")
  const [deposit, setDeposit] = React.useState(0)
  const [isSending, setSending] = React.useState(false)

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        console.log(`get greeting start`)
        window.contract.get_greeting()
          .then(greetingFromContract => {
            console.log(`greeting from contract`)
            if (greetingFromContract && greetingFromContract.length > 0) {
              console.log(`greeting from contract ${greetingFromContract.length}`)
              set_greeting(greetingFromContract)
            }
          }).catch(err => {
          console.log(`get greeting error: ${err}`)
        })
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <Stack tokens={containerStackTokens}>
          <Stack.Item align="center">
            <Text variant={'xxLarge'} block>
              Welcome to Near Guest book!
            </Text>
          </Stack.Item>
          <Stack.Item align="center">
            <Text variant={'large'} block>
              Go ahead and sign in to vote up Microsoft Fluent UI!
            </Text>
          </Stack.Item>
          <Stack.Item align="center" styles={stackItemStyles}>
            <PrimaryButton text="Sign in" onClick={login} allowDisabledFocus/>
          </Stack.Item>
        </Stack>

      </main>
    )
  }

  const listItems = () => {
    greeting.map((number) => <li>{number}</li>)
  }

  const toggleMs = () => toggleLikeMs(!likeMs)
  const handleMsgChange = (msg) => {
    console.log(`new message: ${msg.target.value}`)
    let newMsg = msg.target.value;
    if (newMsg.length > 0) {
      setButtonDisabled(false)
    } else {
      setButtonDisabled(true)
    }
    setMessage(newMsg)
  }
  const handleDonationChange = (msg) => {
    console.log(`new donation: ${msg.target.value}`)
    let newDepo = msg.target.value;
    if (newDepo.length > 0) {
      if (!isNaN(newDepo)) {
        setDeposit(parseInt(msg.target.value, 10));
      } else {
        setDeposit(0)
      }
    } else {
      setDeposit(0)
    }
  }
  const onSubmit = (e) => {
    e.preventDefault();

    setButtonDisabled(true)
    setDeposit(0)
    setMessage("")
    setSending(true)
    // TODO: optimistically update page with new message,
    // update blockchain data in background
    // add uuid to each message, so we know which one is already known
    console.log("send message to contract")
    window.contract.set_greeting(
      {message: message, vote: likeMs},
      BOATLOAD_OF_GAS,
      Big(deposit || '0').times(10 ** 24).toFixed()
    ).then(() => {
      window.contract.get_greeting().then(messages => {
        console.log(`greeting from set_greeting`)
        if (messages && messages.length > 0) {
          set_greeting(messages)
        }
        setSending(false)
        setButtonDisabled(false)
      });
    }).catch(() => {
      alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
      )
      throw e
    });
  };

  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <>
      <main>
        <h1>
          <label
            htmlFor="greeting"
            style={{
              color: 'var(--secondary)',
              borderBottom: '2px solid var(--secondary)'
            }}
          >
          </label>
          {' '/* React trims whitespace around tags; insert literal space character when needed */}
          {/*{window.accountId}!*/}
        </h1>
        <form onSubmit={async event => {

          try {
            // make an update call to the smart contract
            await window.contract.set_greeting({
              // pass the value that the user entered in the greeting field
              message: newGreeting
            })
          } catch (e) {
            alert(
              'Something went wrong! ' +
              'Maybe you need to sign out and back in? ' +
              'Check your browser console for more info.'
            )
            throw e
          } finally {
            // re-enable the form, whether the call succeeded or failed
            fieldset.disabled = false
          }

          // update local `greeting` variable to match persisted value
          set_greeting(newGreeting)

          // show Notification
          setShowNotification(true)

          // remove Notification again after css animation completes
          // this allows it to be shown again next time the form is submitted
          setTimeout(() => {
            setShowNotification(false)
          }, 11000)
        }}>
        </form>
        <Stack tokens={{childrenGap: 20}}>
          <Stack.Item align="center" styles={stackItemStyles}>
            <PrimaryButton text="Sign out" onClick={logout} allowDisabledFocus/>
          </Stack.Item>
          <Stack.Item align="center">
            <Toggle label="I like minimalistic Microsoft Fluent UI" defaultChecked onText="On" offText="Off"
                    onChange={toggleMs}/>
          </Stack.Item>
          <Stack.Item align="center">
            <TextField label={"Sign the guest book: " + window.accountId}
                       prefix={"message"} value={message} onChange={(msg) => handleMsgChange(msg)}/>
          </Stack.Item>
          <Stack.Item align="center">
            <TextField label={"Donation optional"}
                       value={deposit}
                       prefix={"Near: "} onChange={(msg) => {
              handleDonationChange(msg)
            }}/>
          </Stack.Item>
          {!isSending && <Stack.Item align="center" styles={stackItemStyles}>
            <PrimaryButton text="Sign" disabled={buttonDisabled} onClick={onSubmit} allowDisabledFocus/>
          </Stack.Item>}
          {isSending && <Stack.Item align="center">
            <Spinner label="Transaction sending ..." ariaLive="assertive" labelPosition="right"/>
          </Stack.Item>}
          <Stack.Item align="center">
            <Text variant={'xxLarge'} block>
              Messages
            </Text>
          </Stack.Item>
          {greeting && greeting.length > 0 && greeting.map((value, index) => <Stack.Item key={index} align="start"
                                                                                         tokens={{childrenGap: 20}}>
            <Persona text={value.account_id}
                     imageUrl={value.is_premium && TestImages.iconOne}
                     imageInitial='MS'
                     secondaryText={value.like_ms
                       ? `${value.message} like MS Fluen UI`
                       : `${value.message} don't like MS Fluen UI`
                     }
                     size={PersonaSize.size48}/>
          </Stack.Item>)}
        </Stack>

      </main>
      {showNotification && <Notification/>}
    </>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
