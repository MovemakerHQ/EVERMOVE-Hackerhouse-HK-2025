package aptos

import "github.com/aptos-labs/aptos-go-sdk"

client := nil
client, err := aptos.NewClient(aptos.DevnetConfig)
if err != nil {
panic("Failed to create client:" + err.Error())
}