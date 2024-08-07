const init = () => {
	BigInt.prototype.toJSON = function () {
		return Number(this);
	};
};

export { init };
