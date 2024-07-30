export const respondSuccess = (response, message, args) => {
	response.status(200).json({success:true, message: message, ...args });
};

export const respondFail = (response, message) => {
	response.status(200).json({success:false, message: message });
};
