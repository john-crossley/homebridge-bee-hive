# 🐝 Homebridge Bee Hive 🐝

This plugin came about because the one I was using seemed very unreliable. The plugin only supports *Light Switches* I do intend to enhance the feature set in the future, so hang tight. Alternatively, make a PR!

# Homebridge

This is a plugin for Homebridge. Get started by visiting their GitHub page [https://github.com/nfarina/homebridge](https://github.com/nfarina/homebridge)

# Installation

`npm install -g homebridge-bee-hive`

You'll then need to modify your `config.json` file to contain the following...

### Registering a Light Bulb

```json
"accessories": [{
    "accessory": "HomebridgeBeeHive",
    "product": "light-bulb",
    "displayName": "Front Room",
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "username": "me@example.com",
    "password": "myPassword0912"
}],
```

| Attribute  | Value  | Reason  |
|---|---|---|
| accessory | HomebridgeBeeHive  | The name of the plugin  |
| product | light-bulb  | The product that you want to initialise  |
| displayName | Front Room  | How this will appear to Home/Siri  |
| id | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  | The UUID found in [http://my.hivehome.com/](http://my.hivehome.com/)  |
| username | Hive Home Username  | Allows the plugin to access Hive's API  |
| password | Hive Home Password  | Allows the plugin to access Hive's API  |
