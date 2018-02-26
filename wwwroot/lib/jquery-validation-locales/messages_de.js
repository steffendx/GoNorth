$.extend( $.validator.messages, {
	required: "Dieses Feld ist ein Pflichtfeld.",
	maxlength: $.validator.format( "Gib bitte maximal {0} Zeichen ein." ),
	minlength: $.validator.format( "Gib mindestens {0} Zeichen ein." ),
	rangelength: $.validator.format( "Gib mindestens {0} und maximal {1} Zeichen ein." ),
	email: "Gib bitte eine gültige E-Mail Adresse ein.",
	url: "Gib bitte eine gültige URL ein.",
	date: "Bitte gib ein gültiges Datum ein.",
	number: "Gib bitte eine Nummer ein.",
	digits: "Gib bitte nur Ziffern ein.",
	equalTo: "Bitte denselben Wert wiederholen.",
	range: $.validator.format( "Gib bitte einen Wert zwischen {0} und {1} ein." ),
	max: $.validator.format( "Gib bitte einen Wert kleiner oder gleich {0} ein." ),
	min: $.validator.format( "Gib bitte einen Wert größer oder gleich {0} ein." ),
	creditcard: "Gib bitte eine gültige Kreditkarten-Nummer ein."
});