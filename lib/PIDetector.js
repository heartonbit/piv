/* Get detector instance via closure */
var detector = (function(){
	'use-strict';
	
	/* private variables */
    var rules = []; //Set of rules which can be added
    var results = []; //Set of detected object
    var empty = "검출된 개인정보가 없습니다.";

    /* methods */
	function init () {
		results = [];
	}

	function detect (str, regex, rule) {
		
		trace("start detect function with :"+regex);
		
		var retVal = false, match = [];
		
        regex.lastIndex = 0; //init lastIndex

		while((match = regex.exec(str)) !== null){

			trace("pattern matched: "+match[0]);

		    if(rule.fn){
		        retVal = (rule.fn(match[0]) || retVal); 
		    }else{
		        retVal = true;
		    }

			trace("retVal:"+retVal);

		    if(retVal){
		    	var detected =$.extend({}, rule);
		    	
		    	detected.value = match[0];
		    	
		    	delete detected.regex;
		    	
		    	addDetected(detected);

		    	//break; //stop looping on the first occurance	
		    } 
		}
		
		return retVal;
	}
	
	function addDetected( detected ){

		//Add detected result only when it has unique value
		var isUnique = results.every( function ( element ) { 
			return element.value !== detected.value; 
		});

		if(isUnique) {
			results.push(detected);
		}
	}
	
    return {
    	
    	/* gettter */
    	get empty () { return empty; },
    	get detected () { return results; },
    	
    	'init' : function () {
    		init();	
    	},
        'addRule': function (rule) {
            if(rule.name && rule.regex) {
            	//set message for a new rule
            	rule.msg = rule.name +"(으)로 의심되는 정보가 발견되었습니다.";
            	rules.push(rule);
            }
        },
        'detect': function (str) {
        	
			trace("start detect with :"+str);

            var retVal = false; //default return value

            $(rules).each( function ( i ) {
            	
				trace("start rule ["+i+"]"+rules[i].name);

				if(Object.prototype.toString.call( rules[i].regex ) === '[object Array]'){
					
					$(rules[i].regex).each( function( idx ){
						retVal = detect(str, rules[i].regex[idx], rules[i]) || retVal;
					});
					
				}else{
					
	                retVal = detect(str, rules[i].regex, rules[i]) || retVal;
	                
				}
				
				//return false; //stop looping on the first occurance	
            });
            
			trace("detect return "+retVal);
			
            return retVal;
        }

    }
    
})();


/* Rule set */
detector.addRule({
    'name':"주민등록번호",
    'regex':[
    	/[0-9]{2}((0[1-9])|(1[0-2]))[0-3][0-9]((-?)|[ ])(-?)((-?)|[ ])[1-4][0-9]{6}/g,
    	/[0-9][ ][0-9][ ][0-1][ ][0-9][ ][0-3][ ][0-9]((-?)|[ ])(-?)((-?)|[ ])[1-4][ ][0-9][ ][0-9][ ][0-9][ ][0-9][ ][0-9][ ][0-9]/g
    ],
    'fn': function (str){
    	'use strict';
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
});


detector.addRule({
    'name':"핸드폰번호",
    'regex':[
    	/(01[1|6|7|8|9])((-?)|[)]|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])([0-9]{4})/g
    	,/(01[1|6|7|8|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])([0-9]{4})/g
    	,/(01[1|6|7|8|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{2})((-?)|[ ])(-)((-?)|[ ])([0-9]{4})/g
    	,/(01[0|1|6|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])([0-9]{4})/g
    	,/(01[0|1|6|9])((-?)|[)]|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])([0-9]{4})/g
    	,/(01[0|1|6|9])((-?)|[ ])([-]|[)])((-?)|[ ])([2-9]{1})([0-9]{3})((-?)|[ ])(-)((-?)|[ ])([0-9]{4})/g
    ]
});


detector.addRule({
	'name':"신용카드번호",
	'regex':[
		/[3|4|5|6|9][0-9]{3}[ ]?-?[ ]?[0-9]{4}[ ]?-?[ ]?[0-9]{4}[ ]?-?[ ]?[0-9]{3,4}/g
		,/[3|4|5|6|9][0-9]{3}[ ]?-?[ ]?[0-9]{6}[ ]?-?[ ]?[0-9]{5}/g
	],
	'fn':luhnsAlgorithm
});


detector.addRule({
	'name':"은행계좌번호",
	'regex':[
		/[0-9]{3}-?[0-9]{6}-?[0-9]{5}/g
		,/[0-9]{3}-?[0-9]{2}-?[0-9]{6}/g
		,/[0-9]{3}-?[0-9]{6}-?[0-9]{2}-?[0-9]{3}/g
		,/100[0-9]{1}-?[0-9]{3}-?[0-9]{6}/g
		,/[0-9]{3}-?[0-9]{2}-?[0-9]{4}-?[0-9]{3}/g
		,/[0-9]{6}-?[0-9]{2}-?[0-9]{6}/g
		,/[0-9]{3}-?[0-9]{2}-?[0-9]{7}/g
		,/[0-9]{3}-?[0-9]{2}-?[0-9]{6}-?[0-9]{1}/g
		,/[0-9]{3}-?[0-9]{3}-?[0-9]{6}/g
	],
	'fn':luhnsAlgorithm
});


detector.addRule({
	'name':"이메일",
	'regex':/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
});