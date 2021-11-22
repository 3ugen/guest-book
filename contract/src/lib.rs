/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. set_greeting: accepts a greeting, such as "howdy", and records it for the user (account_id)
 *    who sent the request
 * 2. get_greeting: accepts an account_id and returns the greeting saved for it, defaulting to
 *    "Hello"
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */

use near_sdk::{env, near_bindgen, setup_alloc};
// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::env::attached_deposit;
use near_sdk::serde::{Deserialize, Serialize};

setup_alloc!();

const MESSAGE_LIMIT: i32 = 10;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct User {
    pub account_id: String,
    pub message: String,
    pub is_premium: bool,
    pub like_ms: bool,
}

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    records: Vector<User>,
    like_ms: u64,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            records: Vector::new(b"a"),
            like_ms: 0,
        }
    }
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn set_greeting(&mut self, message: String, vote: bool) {
        let account_id = env::signer_account_id();
        let premium_deposit = env::attached_deposit();
        if vote {
            self.like_ms = self.like_ms + 1;
        }
        let mut is_premium = false;
        if env::attached_deposit() > 0 {
            is_premium = true;
        }

        // Use env::log to record logs permanently to the blockchain!
        env::log(format!("Saving greeting '{}' for account '{}' is_premium {} deposit attached {}", message, account_id, is_premium, premium_deposit).as_bytes());
        let mut is_exist = false;
        for item in self.records.iter() {
            if item.account_id == account_id {
                env::log(b"user exists");
                is_exist = true;
            }
        }
        if !is_exist {
            env::log(b"add new user");
            self.records.push(&User { account_id, message, is_premium, like_ms: vote });
        }
    }

    // `match` is similar to `switch` in other languages; here we use it to default to "Hello" if
    // self.records.get(&account_id) is not yet defined.
    // Learn more: https://doc.rust-lang.org/book/ch06-02-match.html#matching-with-optiont
    pub fn get_greeting(&self) -> Option<Vec<User>> {
        /*match self.records.get(&account_id) {
            Some(greeting) => greeting,
            None => "Hello".to_string(),
        }*/
        // self.records
        if self.records.len() == 0 {
            env::log(b"records not found");
            return None;
        }
        env::log(format!("records counts: {}", self.records.len()).as_bytes());
        let mut res: Vec<User> = Vec::new();
        let mut i: u64 = 0;
        if self.records.len() > 10 {
            i = self.records.len() - 10;
        }
        if self.records.len() == 1 {
            env::log(format!("records len = 1").as_bytes());
            res.push(self.records.get(0).unwrap());
        } else {
            for x in i..(self.records.len()) {
                env::log(format!("push user {}", self.records.get(x).unwrap().message).as_bytes());
                res.push(self.records.get(x).unwrap());
            }
        }
        Some(res)
        // User { account_id, message: "123.".to_string(), is_premium: false }
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 * Learn more about Rust tests: https://doc.rust-lang.org/book/ch11-01-writing-tests.html
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 *
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use near_sdk::{testing_env, VMContext};
    use near_sdk::MockedBlockchain;

    use super::*;

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn set_then_get_greeting() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = Contract::default();
        contract.set_greeting("howdy".to_string());
        assert_eq!(
            "howdy".to_string(),
            contract.get_greeting("bob_near".to_string())
        );
    }

    #[test]
    fn get_default_greeting() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = Contract::default();
        // this test did not call set_greeting so should return the default "Hello" greeting
        assert_eq!(
            "Hello".to_string(),
            contract.get_greeting("francis.near".to_string())
        );
    }
}
