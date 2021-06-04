//stringifies the cyclic object
function stringify(object) {
    var seen = [];
    var data = JSON.stringify(object, function(key, val) {
        if (val != null && typeof val == "object") {
             if (seen.indexOf(val) >= 0) {
                 return;
             }
             seen.push(val);
         }
         return val;
     });
     return data;
}

module.exports = stringify;