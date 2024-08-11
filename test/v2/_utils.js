
export const requestMock = (method, query) => {
	return {
		method: method,
		query: query
	};
};

export const responseMock = () => {
	const response = {};
	response.status = (statusCode) => {
		response.statusCode = statusCode;
		return response;
	};
	response.json = (body) => {response.body = body;};
	return response;
};
