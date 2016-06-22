## Dependencies
 * cordova
 * ionic

## Building
```
ionic platform add android
ionic run android
```

## Marshmallow Permissions
The code currently does not properly handle Marshmallow permission requests.  If you're building it against the Marshmallow or higher Android SDK then you'll need to manually enable permissions for any new install.

To manually enable permissions go to **Settings -> Apps -> Nascent Wifi Setup**  and enable both **Location** and **Storage** permissions.
