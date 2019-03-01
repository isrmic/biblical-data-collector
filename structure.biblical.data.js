const structure = {
	version: {
		nvt: {
			booksnumber: 66,
			books: [
				{
					bookname: String,
					abbrev: String,
					group: String,
					chaptersnumber: Number,
					chapters: [
						{
							versiclesnumber: Number,
						},
					],
				},
			]
		},
	},
};

module.exports = structure;