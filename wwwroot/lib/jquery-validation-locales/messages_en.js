$.extend( $.validator.messages, {
	required: "This field is mandatory.",
	maxlength: $.validator.format( "Please enter a maximum of {0} chars." ),
	minlength: $.validator.format( "Please enter at least {0} chars." ),
	rangelength: $.validator.format( "Please enter at least {0} and at most {1} chars." ),
	email: "Please enter a valid email.",
	url: "Please enter a valid url.",
	date: "Please enter a valid date.",
	number: "Please enter a valid number.",
	digits: "Please enter only digits.",
	equalTo: "Please repeat the same value.",
	range: $.validator.format( "Please enter a value between {0} and {1}." ),
	max: $.validator.format( "Please enter a value equal or less than {0}." ),
	min: $.validator.format( "Please enter a value equal or more than {0}." ),
	creditcard: "Please enter a valid credit card number."
});