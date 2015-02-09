var detector = (function(){
    var rules = [], detected = {};

    return {
        'addRule': function (rule) {
            if(rule.name && rule.regex) rules.push(rule);
        },
        'search': function (str) {
        	
			trace("start search with :"+str);

            var retVal = false; //default return value

            $(rules).each(function(i){
            	
				trace("start rule "+rules[i].name + i);
				trace(rules[i].regex);

                var match;
                rules[i].regex.lastIndex = 0; //init lastIndex

    			while((match = rules[i].regex.exec(str)) !== null){

					trace("pattern matched: "+match[0]);

    			    if(rules[i].fn){
    			        retVal = (retVal || rules[i].fn(match[0])); 
    			    }else{
    			        retVal = true;
    			    }

    			    if(retVal){
    			    	detected =$.extend({},rules[i]);
    			    	detected.value = match[0];

    			    	return false;//stop looping on the first occurance	
    			    } 
    			}
    			
            });
            
			trace("search return "+retVal);
			
            return retVal;
        },
        'getDetected':function(){return detected;}
    }
    
})();



var ssnRule = {
    'name':"주민등록번호",
    'regex':/[0-9]{2}((0[1-9])|(1[0-2]))[0-3][0-9]((-?)|[ ])(-?)((-?)|[ ])[1-4][0-9]{6}/g,
    'fn': function (str){
		var retVal = true;
		str = str.replace ? str.replace("-", "") : ""; //대쉬 제거
		str = str.replace ? str.replace(/ /g, "") : ""; //스페이스 제거
		
		trace("fn:"+str);
		
		/////////////////////////////////////////////////////
		//1. 앞자리 여섯자리가 유효한 날짜값인지 검증
		/////////////////////////////////////////////////////
		//출생세기 판별 로직
		var cent = 2000;
		var type = str.slice(6,7); //7번째 숫자로 검증

		switch (type){
			case "9":
			case "0":
				cent = 1800; //1800년대 출생자
				break;
			case "1":
				cent = 1900; //1900년대 출생자
				break;
			case "2":
				cent = 1900; //1900년대 출생자
				break;
			case "3":
			case "4":
				cent = 2000; //2000년대 출생자
				break;
		}
		
		//앞자리 여섯자리 YYMMDD로 생성후 Date 변환
		var y= parseInt(str.slice(0, 2), 10) + cent;
		var m= parseInt(str.slice(2, 4), 10)-1;
		var d= parseInt(str.slice(4, 6), 10);
		var date= new Date(Date.UTC(y, m, d));
		
		//Date Validate!
		retVal = date.getUTCFullYear()===y && date.getUTCMonth()===m && date.getUTCDate()===d;
		
		/////////////////////////////////////////////////////
		//2. 마지막 자리 Parity checked
		/////////////////////////////////////////////////////		
		var parity = 0;
		var strs = str.slice(0,12).split('');

		$.each(strs, function (index, value){
			parity += value * (index%8 + 2);
		});
		
		parity = (11 - (parity%11))%10; //10은 0으로 11은 1로 간주한다.

		retVal = retVal && parity == str.slice(12,13); //패리티 검증

		return retVal;
	}
}

detector.addRule(ssnRule);

detector.addRule({
	'name':"주민등록번호",
	'regex':/[0-9][ ][0-9][ ][0-1][ ][0-9][ ][0-3][ ][0-9]((-?)|[ ])(-?)((-?)|[ ])[1-4][ ][0-9][ ][0-9][ ][0-9][ ][0-9][ ][0-9][ ][0-9]/g,
	'fn':ssnRule.fn
});

detector.addRule({
    'name':"핸드폰번호",
    'regex':/(01[1|6|7|8|9])((-?)|[)]|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])([0-9]{4})/g
});
detector.addRule({
    'name':"핸드폰번호",
    'regex':/(01[1|6|7|8|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])([0-9]{4})/g
});
detector.addRule({
	'name':"핸드폰번호",
	'regex':/(01[1|6|7|8|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])(-)((-?)|[ ])([0-9]{4})/g
});
detector.addRule({
	'name':"핸드폰번호",
	'regex':/(01[0|1|6|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])([0-9]{4})/g
});
detector.addRule({
	'name':"핸드폰번호",
	'regex':/(01[0|1|6|9])((-?)|[)]|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])([0-9]{4})/g
});
detector.addRule({
	'name':"핸드폰번호",
	'regex':/(01[0|1|6|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])(-)((-?)|[ ])([0-9]{4})/g
});

var credRule = {
	'name':"신용카드번호",
	'regex':/[3|4|5|6|9][0-9]{3}[ ]?-?[ ]?[0-9]{4}[ ]?-?[ ]?[0-9]{4}[ ]?-?[ ]?[0-9]{3,4}/g,
	'fn':function (creditNo){
		/*refer to Luhn algorithm : http://en.wikipedia.org/wiki/Luhn_algorithm*/
			creditNo = creditNo.replace ? creditNo.replace(/ /g, "") : ""; //스페이스 제거
			creditNo = creditNo.replace ? creditNo.replace(/-/g, "") : ""; //대시 제거
			trace("credit:"+creditNo);
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
		    
		    trace("parity:"+ev+",last bit:"+creditNo.slice(-1)+",wsum:"+luhnsum );

		    //compare with parity number
		    return (ev == creditNo.slice(-1));
		}
};
detector.addRule(credRule);

detector.addRule({
	'name':"신용카드번호",
	'regex':/[3|4|5|6|9][0-9]{3}[ ]?-?[ ]?[0-9]{6}[ ]?-?[ ]?[0-9]{5}/g,
	'fn':credRule.fn
});

// detector.addRule({
// 	'name':"신용카드번호",
// 	'regex':/([3|4|5|6|9])[0-9]{15}/g,
// 	'fn': credRule.fn
// });

// detector.addRule({
// 	'name':"신용카드번호",
// 	'regex':/([3|4|5|6])[0-9]{3}[ ](-?)[ ][0-9]{4}[ ](-?)[ ][0-9]{4}[ ](-?)[ ][0-9]{4}/g,
// 	'fn': credRule.fn
// });
// detector.addRule({
// 	'name':"신용카드번호",
// 	'regex':/([3|4|5|6])[0-9]{3}((-?)|[ ])(-)((-?)|[ ])[0-9]{4}((-?)|[ ])(-)((-?)|[ ])[0-9]{4}((-?)|[ ])(-)((-?)|[ ])[0-9]{4}/g,
// 	'fn': credRule.fn
// });
