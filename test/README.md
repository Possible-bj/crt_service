# Important For Runnning the test suite

## On a MacOS?
* You need to change the "test" script in package.json
- currrently it is
``` 
{
    "scripts": {
        "test": "set USE_MOCK_MODEL=1 && mocha --recursive --require dotenv/config",
  },
}
```

Simply change the "set" to "export" for the test script to work.

## On a Windows Machine?
* You don't need to do anything - the test script should work on your machine with "set"