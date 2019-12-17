# 🐝 Homebridge Bee Hive 🐝

This plugin came about because the one I was using seemed very unreliable. The plugin only supports *Light Switches* I do intend to enhance the feature set in the future, so hang tight. Alternatively, make a PR!

### Registering a Light Bulb

```json
"accessories": [{
    "accessory": "HomebridgeBeeHive",
    "product": "light-bulb",
    "displayName": "Front Room",
    "id": "15438d22-1f8d-11ea-978f-2e728ce88125",
    "name": "Front Room",
    "username": "me@example.com",
    "password": "myPassword0912"
}],
```