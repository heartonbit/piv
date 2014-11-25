//Per
var PIValidator = (function (){
    //주민번호 정규식
    var ssnRg = /[0-9]{2}((0[1-9])|(1[0-2]))[0-3][0-9]((-?)|[ ])(-?)((-?)|[ ])[1-4][0-9]{6}/g;
	function isSSN(str){
		var retVal = true;
		str = str.replace ? str.replace("-", "") : ""; //대쉬 제거
		
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
	
	return {
		containPI: function(str){
			var match;
			var flag = false;

			//주민번호 검증
			while( match = ssnRg.exec(str)){
				flag = flag || isSSN(match[0]); //적어도 하나가 SSN일 경우 true
			}
			return flag;
		}
		
	}
    
})();

//Submit Hooking
$(document).ready(function(){    
    $("form").submit(function(e){
        trace($(e.target).serialize());
    
        if(PIValidator.containPI($(e.target).serialize())){
            if(!window.confirm("주민번호로 의심되는 정보가 발견되었습니다.\n\n계속 진행하시겠습니까")){
                e.preventDefault();//실행중단!!!
            }
        }
    });
});