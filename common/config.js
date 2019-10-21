
const websiteUrl = 'https://www.haqh.com';
const RPAList = [];
const getActiveRpa = (callback){
	uni.request({
		url: websiteUrl+'/rpa/index.php',
		method: 'POST',
		dataType: 'json',
		success: (json) => {
			callback(json);
		},fail: (e)=>{
			uni.showToast({
			    icon: 'none',
			    title: '服务器异常100011'
			});
		}
	});
}
 
export default {  
    websiteUrl,  
    RPAList,
    getActiveRpa
}