// Info: Test Cases
'use strict';

// Shared Dependencies
var Lib = {};

// Dependencies
Lib.Utils = require('js-helper-utils');
Lib.Debug = require('js-helper-debug')(Lib);
const Instance = require('js-helper-instance')(Lib);



////////////////////////////SIMILUTATIONS//////////////////////////////////////

// function to simulate cleanup callback
var fake_cleanup_a = function(instance){

  Lib.Debug.log(`I am from cleanup routine 'A'.`);

}

// function to simulate cleanup callback
var fake_cleanup_b = function(instance){

  Lib.Debug.log(`I am from cleanup routine 'B'.`);

}

///////////////////////////////////////////////////////////////////////////////


/////////////////////////////STAGE SETUP///////////////////////////////////////
// Nothing
///////////////////////////////////////////////////////////////////////////////


/////////////////////////////////TESTS/////////////////////////////////////////

// instance variable
var instance;

// Test .initialize() function
instance = Instance.initialize();

// Test .addCleanupRoutine() function. Add cleanup functions to 'instance'
Instance.addCleanupRoutine( instance, fake_cleanup_a );
Instance.addCleanupRoutine( instance, fake_cleanup_b );


// Print values inside 'instance' object
Lib.Debug.log('time:', instance.time);
Lib.Debug.log('time_ms:', instance.time_ms);
Lib.Debug.log('logger_counter:', instance.logger_counter);
Lib.Debug.log('cleanup_queue:', instance.cleanup_queue);


// Test .cleanup() function
////Instance.cleanup(instance); (cleanup runs automatically after background routines are completed)


// Test background parallel jobs

// Job 1
setTimeout( // 1 second delay
  Instance.backgroundRoutine(instance),
  1000
);

// Job 2
setTimeout( // 3 second delay
  Instance.backgroundRoutine(instance),
  3000
);

// Job 3
setTimeout( // 5 second delay
  Instance.backgroundRoutine(instance),
  5000
);

///////////////////////////////////////////////////////////////////////////////
