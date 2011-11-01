// Implementes dendritic growth as described in section 
// "A 3D CA model of ‘Free’ Dendritic growth" of 
// http://sjsu.rudyrucker.com/~gauri.nadkarni/paper/

var Automata = {

  resolution : 100,
  state : null,
  state_b : null,
  frequency : 0.001,
  speed : 10,
  world : null,

  init : function(){
    var self = this;
    this.world = jQuery('#world')[0];
    this.heatReleasedOnFreezing = 0.5;
    this.solidLiquidInterfaceEnergy = 20;
    this.coolingRate = 0.01;
    this.solidState = this.createState(this.resolution );
    this.tempState = this.createState( this.resolution );
    this.solidState_b = this.createState(this.resolution );
    this.tempState_b = this.createState( this.resolution );
    this.solidState = this.populateState(this.solidState, this.frequency);
    this.tempState = this.populateTempState( this.tempState );

    this.run(this.solidState, this.tempState, 
             this.solidState_b, this.tempState_b, 
             this.world, this.resolution);
  },

  run : function(oldSolidState, oldTempState, newSolidState, newTempState, world, resolution){
    var self = this;
    this.renderState(oldSolidState, world, resolution);
    newSolidState = this.writeNewSolidState(oldSolidState, oldTempState, newSolidState );
    newTempState = this.writeNewTempState( oldTempState, newTempState );

    setTimeout(function(){
      self.run(newSolidState, newTempState, oldSolidState, oldTempState, world, resolution);
    }, self.speed);
  },

  writeNewSolidState : function(oldSolidState, oldTempState, newSolidState ){
    var size = oldSolidState.length;
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        var solidNeighbors = this.solidNeighbors(oldSolidState, i, j);

        if( oldSolidState[i][j] == 0 ) { // still liquid
          var tempCoefficient = ( solidNeighbors == 0 ) ? 0 : 1 / solidNeighbors;
          var critTemp = -this.solidLiquidInterfaceEnergy * tempCoefficient;
          if( solidNeighbors >= 2 && oldTempState[i][j] <= critTemp ) {
            console.log( "Critical temp: " + critTemp + " and real temp: " + oldTempState[i][j] );
            newSolidState[i][j] = 1;
            oldTempState[i][j] += this.heatReleasedOnFreezing;
          } else {
            newSolidState[i][j] = oldSolidState[i][j];
          }
        } else { // as a solid, check if we need to melt
          if( oldTempState[i][j] > 0 ) {
            newSolidState[i][j] = 0;
            oldTempState[i][j] -= this.heatReleasedOnFreezing;
          } else {
            newSolidState[i][j] = oldSolidState[i][j];
          }
        }
      }
    }
    return newSolidState;
  },

  writeNewTempState : function( oldTempState, newTempState ) {
    var size = oldTempState.length;
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        newTempState[i][j] = oldTempState[i][j] + 
                             this.coolingRate * this.averageNeighborhoodTemp( oldTempState, i, j );
      }
    }
    return newTempState;
  },

  averageNeighborhoodTemp : function( state, i, j ) {
    var max_index = state.length-1;
    var temp = 0;
    var count = 0;

    for (var k = -1 ; k < 2 ; k++) {
      for (var l = -1 ; l < 2 ; l++) {
        if( ( k != 0 && l != 0 ) || ( k == 0 && l == 0 ) ) {
          // for now only take the neighbor directly 
          // above, below, left and right
          continue;
        }

        var _i = (i+k < 0 || i+k > max_index) ? (i+k < 0 ? max_index : 0) : i+k;  
        var _j = (j+l < 0 || j+l > max_index) ? (j+l < 0 ? max_index : 0) : j+l;  
        temp += state[_i][_j];
        ++count;
      }
    }
    return temp / count;
  },

  solidNeighbors : function(state, i, j){
    var max_index = state.length-1;
    var count = 0;
    for (var k = -1 ; k < 2 ; k++) {
      for (var l = -1 ; l < 2 ; l++) {
        if( k == 0 && l == 0 ) { // don't count ourselves as neighbors
          continue;
        }

        var _i = (i+k < 0 || i+k > max_index) ? (i+k < 0 ? max_index : 0) : i+k;  
        var _j = (j+l < 0 || j+l > max_index) ? (j+l < 0 ? max_index : 0) : j+l;  
        count += state[_i][_j] || 0;
      }
    }
    return count;
  },
  
  createState : function(resolution){
    var state = new Array(resolution);
    for (var i = 0 ; i < resolution ; i++) {
      state[i] = new Array(resolution);
      for (var j = 0; j < resolution ; j++) {
        state[i][j] = 0;
      }
    }
    return state;
  },

  populateState : function(state, frequency){
    var size = state.length;
    for (var i = 0; i < size; i++) {
      for (var j = 0 ; j < size; j++) {
        if( Math.random() < frequency ) {
          // generate a 3x3 seed for the ice flowers to start growing
          this.setNeighborhoodToOne( state, i, j );
        }
      }
    }
    return state;
  },

  setNeighborhoodToOne : function( state, i, j ) {
    var max_index = state.length-1;

    for (var k = -1 ; k < 2 ; k++) {
      for (var l = -1 ; l < 2 ; l++) {
        var _i = (i+k < 0 || i+k > max_index) ? (i+k < 0 ? max_index : 0) : i+k;  
        var _j = (j+l < 0 || j+l > max_index) ? (j+l < 0 ? max_index : 0) : j+l;  
        state[_i][_j] = 1;
      }
    }
  },
  populateTempState : function( state ) {
    var size = state.length;
    for (var i = 0; i < size; i++) {
      for (var j = 0 ; j < size; j++) {
        state[i][j] = 0 + ( Math.random()*6 - 3 );
      }
    }
    return state;
  },

  renderState : function(state, world, resolution){
    var html = '';
    var size = state.length;
    var cellSize = 100/resolution;
    for (var i = 0; i < size; i++){
      for (var j = 0; j < size; j++){
        if (state[i][j]){
          // Editing the css on this line is a cheap and dirty way to 'solve' the problem without really thinking about it 
          html+='<div class="cell" style="height:'+cellSize+'%;width:'+cellSize+'%;left:'+cellSize*i+'%;top:'+cellSize*j+'%"></div>';
        }
      }
    }
    jQuery(world).html(html);
  }
}
