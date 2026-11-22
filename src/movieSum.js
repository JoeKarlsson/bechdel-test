/**
 * Read MovieSum (Saxena & Keller, ACL 2024; CC BY-NC 4.0): 2,200 screenplays
 * marked up in XML, each with its film's IMDb id, as plain screenplay text in
 * the usual layout (cues and dialogue indented) for the parser.
 */
const { decodeHtmlEntities } = require('./imsdb');

const DATASET = 'https://huggingface.co/datasets/rohitsaxena/MovieSum/resolve/main';
const SPLITS = ['train', 'val', 'test'].map(split => `${DATASET}/${split}.jsonl`);

// Where each element sits on the page, and how wide it runs
const LAYOUT = {
	stage_direction: { indent: 0, width: 60 },
	scene_description: { indent: 0, width: 60 },
	character: { indent: 20, width: 40 },
	parenthetical: { indent: 15, width: 30 },
	dialogue: { indent: 10, width: 35 },
};

// The action lines went through a tokenizer: "-LRB- mid - twenties -RRB- ." -> "(mid-twenties)."
const detokenize = text => text
	.replace(/-LRB-/g, '(').replace(/-RRB-/g, ')')
	.replace(/\( +/g, '(')
	.replace(/-LSB-\s*/g, '[').replace(/\s*-RSB-/g, ']')
	.replace(/``\s*|\s*''/g, '"')
	.replace(/ (?=[.,;:!?%)]|'s\b|n't\b|'re\b|'ll\b|'ve\b|'m\b|'d\b)/g, '')
	.replace(/(\w) - (\w)/g, '$1-$2')
	.replace(/\s+/g, ' ')
	.trim();

const wrap = (text, width) => {
	const lines = [];
	let line = '';
	for (const word of text.split(' ')) {
		if (line && line.length + word.length + 1 > width) {
			lines.push(line);
			line = word;
		} else line = line ? `${line} ${word}` : word;
	}
	return line ? [...lines, line] : lines;
};

/** One MovieSum script's XML as screenplay text */
const scriptTextOfXml = xml => [...xml.matchAll(new RegExp(`<(${Object.keys(LAYOUT).join("|")})>([\\s\\S]*?)</\\1>`, "g"))].flatMap(([, tag, body]) => {
	const layout = LAYOUT[tag];
	const text = detokenize(decodeHtmlEntities(body));
	if (!layout || !text) return [];
	const lines = wrap(text, layout.width).map(line => ' '.repeat(layout.indent) + line);
	// A blank line before each element except dialogue and parentheticals, which follow their cue
	return tag === 'dialogue' || tag === 'parenthetical' ? lines : ['', ...lines];
}).join('\n');

/** A JSONL row's film: "The Boondock Saints_1999" -> { title, year, imdbId, xml } */
const filmOfRow = ({ movie_name: name, imdb_id: imdbId, script: xml }) => {
	const [, title, year] = name.match(/^(.*)_(\d{4})$/) ?? [name, name, null];
	return { title, year, imdbId, xml };
};

module.exports = { SPLITS, scriptTextOfXml, filmOfRow };
