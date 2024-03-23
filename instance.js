// Info: Boilerplate library. Contains Functions related to 'Instance'
'use strict';

// Shared Dependencies (Managed by Loader)
var Lib = {};

// Exclusive Dependencies
var CONFIG = {}; // No Config (for future scope). Loader can override it with Custom-Config


/////////////////////////// Module-Loader START ////////////////////////////////

  /********************************************************************
  Load dependencies and configurations

  @param {Set} shared_libs - Reference to libraries already loaded in memory by other modules
  @param {Set} config - Custom configuration in key-value pairs

  @return nothing
  *********************************************************************/
  const loader = function(shared_libs, config){

    // Shared Dependencies (Must be loaded in memory already)
    Lib.Utils = shared_libs.Utils;
    Lib.Debug = shared_libs.Debug;

    // Override default configuration
    if( !Lib.Utils.isNullOrUndefined(config) ){
      Object.assign(CONFIG, config); // Merge custom configuration with defaults
    }

  };

//////////////////////////// Module-Loader END /////////////////////////////////



///////////////////////////// Module Exports START /////////////////////////////
module.exports = function(shared_libs, config){

  // Run Loader
  loader(shared_libs, config);

  // Return Public Funtions of this module
  return Instance;

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START///////////////////////////////
const Instance = { // Public functions accessible by other modules

  /********************************************************************
  Initialize request 'Instance Object'. This instance is passed onto Functions.
  Note: Just like callback function, referance to request-instance object is also passed. It's reference is lightweight.

  Params: None

  @return {reference} - Returns reference to this class object
  *********************************************************************/
  initialize: function(){

    // Default Data
    var obj = {
      'time'              : 0,      // Instance Initiation Time
      'time_ms'           : 0,      // Instance Initiation Time in milli-seconds
      'logger_counter'    : 0,      // Return number of times activity logging has been done in this instance
      'background_queue'  : 0,      // Counter to keep track of active parallel background routines
      'cleanup_queue'     : [],     // Array to keep list of 'cleanup functions'
      'cleanup_locked'    : false   // Lock Cleanup process if this is true
    };


    // Instance Initiation Time
    obj['time'] = Lib.Utils.getUnixTime(); // Current time on server in seconds
    obj['time_ms'] = Lib.Utils.getUnixTimeInMilliSeconds(); // Current time on server in milli-seconds


    // Return Obj
    return obj;

  },


  /********************************************************************
  Add a cleanup function to 'instance'
  Note: Cleanup functions can only accept one parameter which is 'instance'. For example Sql.close(instance).

  @param {reference} instance - Request Instance object reference
  @param {Function} cleanup_function - Request Instance object reference

  @return {void} - returns nothing
  *********************************************************************/
  addCleanupRoutine: function(instance, cleanup_function){

    // Push this cleanup function to 'cleanup_queue' property of instance
    instance['cleanup_queue'].push( cleanup_function );

  },


  /********************************************************************
  Run all the cleanup functions in 'cleanup' queue
  Note: All async functions in cleanup routine will run in background without any callback on completion

  @param {reference} instance - Request Instance object reference

  @return {void} - returns nothing
  *********************************************************************/
  cleanup: function(instance){

    // Run only if all the background routines are finished and there is atleast one function in cleanup array
    if(
      instance['background_queue'] <= 0 && // No pending background routines
      instance['cleanup_queue'].length > 0 && // one or more function is available in cleanup array
      !instance['cleanup_locked'] // if cleanup is not locked
    ){

      // Iterate each item in array
      instance['cleanup_queue'].forEach(function(cleanup_function){
        cleanup_function(instance); // execute function
      });

      // Reset cleanup_queue
      instance['cleanup_queue'] = [];

    }

  },


  /********************************************************************
  Add a background routine to 'instance'
  Note: Background routine can run in parallel and usually do not need to Response Gateways
  Note: On completion of a background-routine, cleanup will be performed if no more background-routines are pending

  @param {reference} instance - Request Instance object reference

  @return {function} - returns a function that should be used as callback on completion of background-function
  *********************************************************************/
  backgroundRoutine: function(instance){

    // Increment counter for new parallel background routine
    instance['background_queue']++;

    // Return function to be executed as callback on completion of this newly added background routine
    return function(){
      _Instance.backgroundRoutineComplete(instance);
    }

  },

};///////////////////////////Public Functions END///////////////////////////////



//////////////////////////Private Functions START///////////////////////////////
const _Instance = { // Private methods accessible within this modules only

  /********************************************************************
  Callback function that is executed on completion of background routine

  @param {reference} instance - Request Instance object reference

  @return {void} - returns nothing
  *********************************************************************/
  backgroundRoutineComplete: function(instance){

    // Decrement counter for routines working in background
    instance['background_queue']--;

    // Run instance cleanup() routine (cleanup routine internally checks for pending background routines)
    Instance.cleanup(instance);

  },

};//////////////////////////Private Functions END///////////////////////////////
