var fs = require('fs')
fs.readFile("./dist/bundle.js", 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}

	const result = data
		.replace("const geometry = new File([new Blob([geometryBuffer])], `${this.id}.glb`);", "const geometry = new Blob([geometryBuffer]);")
		.replace("const data = new File([new Blob([dataString])], `${this.id}.json`);", "const data = new Blob([dataString]);")
		.replace("const geometry = new Blob([geometryBuffer]);", "const geometry = Buffer.from(geometryBuffer);")
		.replace("const data = new Blob([dataString]);", "const data = dataString");

	fs.writeFile("./dist/bundle.js", result, 'utf8', function (err) {
		if (err) return console.log(err);
	});
});