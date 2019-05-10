# About

Blackhole is an API based database, which will contain different types of data in perspective and make them available via API. Both reading and importing the data is done exclusively through the API, which is secured by using an HMAC based token.

At the heart of the data are the alerts collected by a core importer.

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

1. Make sure you have [NodeJS](https://nodejs.org/) and [yarn](https://yarnpkg.com) installed and the .env file exists (use env.sample)
2. Install your dependencies

    ```
    cd path/to/blackhole
    yarn install
    ```

3. Start your app

    ```
    yarn dev
    ```

## Testing

Simply run `yarn test` and all your tests in the `test/` directory will be run.

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).

## Changelog

__0.1.0__

- Initial release

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).
