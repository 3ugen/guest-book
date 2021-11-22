#!/usr/bin/env bash
#near call $NEAR_ACCT set_greeting '{
#  "hello": "welcome new user"
#}' --accountId 3ugen.testnet && \
#near call $NEAR_ACCT get_greeting '{
#  "hello": "welcome new user"
#}' --accountId 3ugen.testnet
#near delete $NEAR_ACCT 3ugen.testnet && \
./build.sh && \
export NEAR_ACCT=guest-book.3ugen.testnet && \
sleep 1 && \
near create-account $NEAR_ACCT --masterAccount 3ugen.testnet --initialBalance 10 && \
sleep 1 && \
near deploy $NEAR_ACCT --wasmFile ./res/greeter.wasm && \

export NEAR_ACCT=dev-1637479856902-84300414267604 && \
near call $NEAR_ACCT set_greeting '{
  "message": "welcome new user"
}' --accountId 3ugen.testnet && \
near call $NEAR_ACCT get_greeting '{"account_id": "3ugen.testnet"}' --accountId 3ugen.testnet
