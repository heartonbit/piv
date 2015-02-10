// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function(callback /*, initialValue*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(this), len = t.length >>> 0, k = 0, value;
    if (arguments.length == 2) {
      value = arguments[1];
    } else {
      while (k < len && ! k in t) {
        k++; 
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }
    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  };
}

/* refer to Luhn algorithm : http://en.wikipedia.org/wiki/Luhn_algorithm */
function luhnsAlgorithm(creditNo) {
    
    'use strict';
    
    //trace("credit:"+creditNo);
    if(!creditNo.replace){
        throw "no replace function";
    }
    
    creditNo = creditNo.replace(/ /g, "")//remove space
                       .replace(/-/g, ""); //remove dash(-)

    //get evaluation value
    var luhnsum= creditNo.toString()
               .split('', creditNo.length-1)
               .reverse() 
               .reduce(function(pv,cv,i){
                           var x = i % 2 === 0 ? 2 : 1;
                           //console.log("i:"+i+", x:"+x);
                           var retNum = parseInt(cv)*x;
                   
                           if(retNum >= 10){
                               retNum = retNum.toString()
                                              .split('')
                                              .reduce(function(pv,cv){
                                                  return parseInt(pv)+parseInt(cv);
                                              });
                            }
                            return parseInt(pv) + retNum;
               }, 0);
    var ev = 10 - (luhnsum % 10);
    
    //trace("parity:"+ev+",last bit:"+creditNo.slice(-1)+",wsum:"+luhnsum );
    
    //compare with parity number
    return (ev == creditNo.slice(-1));
}

// trace function for debugging
var trace = trace || function (msg) {
	'use strict';
	try{console.log(msg); } catch (ignore) {}
};