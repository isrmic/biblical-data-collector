const books = {
	'1Samuel': '1º Samuel',
	'2Samuel': '2º Samuel',
	'1Reis': '1º Reis',
	'2Reis': '2º Reis',
	'1Crônicas': '1º Crônicas',
	'2Crônicas': '2º Crônicas',
	'Cântico dos Cânticos': 'Cânticos',
	'Miqueias': 'Miquéias',
	'1Coríntios': '1ª Coríntios',
	'2Coríntios': '2ª Coríntios',
	'1Tessalonicenses': '1ª Tessalonicenses',
	'2Tessalonicenses': '2ª Tessalonicenses',
	'1Timóteo': '1ª Timóteo',
	'2Timóteo': '2ª Timóteo',
	'1João': '1ª João',
	'2João': '2ª João',
	'3João': '3ª João',	

};

module.exports = async (book, infobooks) => {
	
	const key = books[book.bookname] || book.bookname;
	const infobook = infobooks[key];

	book.abbrev = infobook.abbrev;
	book.author = infobook.author;
	book.testament = infobook.testament;
	book.group = infobook.group;

};