# Important For Runnning the test suite

## On a MacOS?
**You need to change the "test" script in package.json**
``` 
{
    "scripts": {
        "test": "export USE_MOCK_MODEL=1 && mocha --recursive --require dotenv/config", ✅ // correct
        "test": "set USE_MOCK_MODEL=1 && mocha --recursive --require dotenv/config" ❌ // wrong
  },
}
```
> if test uses "set" - Simply change the "set" to "export" for the test script to work.
> else if test uses "export" - Simply do nothing

## On a Windows Machine?
**You need to change the "test" script in package.json**
``` 
{
    "scripts": {
        "test": "set USE_MOCK_MODEL=1 && mocha --recursive --require dotenv/config", ✅ // correct
        "test": "export USE_MOCK_MODEL=1 && mocha --recursive --require dotenv/config" ❌ // wrong
  },
}
```
> if test uses "export" - Simply change the "export" to "set" for the test script to work.
> else if test uses "set" - Simply do nothing
