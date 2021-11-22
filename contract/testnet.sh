#!/usr/bin/env bash
#near call $NEAR_ACCT set_greeting '{
#  "hello": "welcome new user"
#}' --accountId 3ugen.testnet && \
#near call $NEAR_ACCT get_greeting '{
#  "hello": "welcome new user"
#}' --accountId 3ugen.testnet
./build.sh && \
export NEAR_ACCT=guest-book.3ugen.testnet && \
near delete $NEAR_ACCT 3ugen.testnet && \
sleep 1 && \
near create-account $NEAR_ACCT --masterAccount 3ugen.testnet --initialBalance 5 && \
sleep 1 && \
near deploy $NEAR_ACCT --wasmFile ./res/greeter.wasm && \
sleep 1 && \
near call $NEAR_ACCT get_greeting '{}' --accountId 3ugen.testnet
sleep 1 && \
near call $NEAR_ACCT set_greeting '{
  "message": "welcome new user"
  },
  300000000000000,
  1000000000000000000000000' --accountId 3ugen.testnet && \
sleep 1 && \
near call $NEAR_ACCT get_greeting '{}' --accountId 3ugen.testnet
