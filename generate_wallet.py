from algosdk import account, mnemonic

# Generate a new Algorand account
private_key, address = account.generate_account()

print("Public Wallet Address:")
print(address)

print("\n25-Word Recovery Phrase:")
print(mnemonic.from_private_key(private_key))
