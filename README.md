# Slate Event Source Table Replicator

The purpose of the slate-replicator is to copy a table of immutable events from an Event Source database to an events table in one or more Destination databases.

Replication is triggered by events being added to the Event Source database events table.

slate-replicator requires node version 6 or greater.

# Installation
> npm install -g git://github.com/elm-slate/slate-replicator

# Usage

#### Start slate-replicator

    slate-replicator [options]

  Options:

    -h, --help                 output usage information
    -c, --config-filename <s>  configuration file name
    --dry-run                  if specified, display run parameters and end program without starting replicator

#### Stop slate-replicator

    ^C to stop replicator

The replicator copies in a transactional manner so it can be stopped at any time

## Configuration file

### Sample configuration file

```javascript
  var config = {
    // optional parameter.  maximum events written to the replicationDestinations events tables per database operation.  minimum value:  10000.
    maxEventsPerWrite: 10000,
    // optional parameter.  database connection timeout in milliseconds.  default value:  15000.
    connectTimeout: 15000,
    // connection parameters to immutable event source database events table
    eventSource: {
      host: 'localhost',
      databaseName: 'sourceDb',
      // optional parameter.  connection attempt will fail if missing and needed by database.
      user: 'user1',
      // optional parameter.  connection attempt will fail if missing and needed by database.
      password: 'pass1'
    },
    // array of connection parameters to one or more replication databases events tables.  one replication destination is required.
    replicationDestinations: [
      {
        host: 'localhost',
        databaseName: 'replicationDb1',
        // optional parameter.  connection attempt will fail if missing and needed by database.
        user: 'user1',
        // optional parameter.  connection attempt will fail if missing and needed by database.
        password: 'pass1'
      },
      {
          host: 'localhost',
          databaseName: 'replicationDb2',
          // optional parameter.  connection attempt will fail if missing and needed by database.
          user: 'user1',
          // optional parameter.  connection attempt will fail if missing and needed by database.
          password: 'pass1'
    ]
  };
  module.exports = config;
  ```
#### maxEventsPerWrite
> An optional parameter that specifies the maximum number of events that can be written to the events table in each `replicationDestination` database per write operation.  Default and minimum value is `10000`.

#### connectTimeout
> An optional parameter that specifies the maximum number of milliseconds to wait to connect to a database before throwing an Error.  Default value is `15000` milliseconds.


#### eventSource
  > Parameters used to connect to the Event Source database

| Field         | Required | Description                
| ------------- |:--------:| :---------------------------------------
| host          | Yes      | database server name
| databaseName  | Yes      | database name containing the events table         
| user          | No       | database user name.  connection attempt will fail if missing and required by database.
| password      | No       | database user password.  connection attempt will fail if missing and required by database.

#### replicationDestinations
> An array of one or more objects containing parameters identical to `eventSource` parameters.  These parameters are used to connect to `replicationDestination` databases which must contain a table called `events`.  The `replicationDestination` databases are where the events from the `eventSource` database `events` table are copied.

# Database Schema
All databases used in the replication process must have an `events` table that has the same schema.

The `eventSource` database has more functionality than the `replicationDestination` databases.

The `events` table in the `eventSource` database has a trigger and trigger function that support the notification process mentioned in the [`Run`](#Run) section.

Also the `eventSource` database has an `id` table that is used to provide values for the `id` column in the `events` table.

There is also an `insert_events` function in the `eventSource` database that is used to insert events into the `events` table in a transactional manner.

For further database schema information, please refer to [`slate-init-db`](https://github.com/elm-slate/init-slate-db).

# Operations
### Start up validations
- Configuration parameters are validated
- The locations for the `eventSource events` table and `replicationDestination events` tables are validated, e.g. the source and destinations are unique
- If the `events` table in any `replicationDestination` database is non-empty, then the first event in that table must be equal the first event in the `eventSource` database
- Row counts and maximum id column values in the `eventSource` and `replicationDestination events` tables are checked for consistency
- If the `slate-replicator` is started in `--dry-run` mode then it will validate and display configuration parameters without running the replicator
- All start-up information and any configuration errors are logged

### Run
The `slate-replicator` listens for notifications generated by an `events` table trigger in the `eventSource` database using the `Postgresql LISTEN` command. This triggers the replication process. Notifications are generated by the `Postgresql pg_notify` function when events are inserted into the `events` table in the `eventSource` database.

Each time the replication process is triggered, it will replicate all events that are missing from the `replicationDestination` database.

### Shutdown
The `slate-replicator` can be shutdown using the `Cntrl-C` keystroke.

### Exceptions
The `slate-replicator` process ends when any exception occurs.  Since the replication process is transactional, the `slate-replicator` can be restarted at any time.  If an exception stops the `slate-replicator`, some other process needs to start it again.

### Logging
The `slate-replicator` uses the `bunyan` logging library to log all exceptions and informational messages. Logging is done to the console as the replicator was designed to be run in a Docker container.
