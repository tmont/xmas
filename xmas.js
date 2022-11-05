#!/usr/bin/env node

const lliw = require('lliw');
const debug = false;

class Person {
	constructor(name) {
		this.name = name;
	}
}

class GivingSet {
	constructor(people) {
		this.givings = new Map();

		if (people) {
			people.forEach(person => {
				this.givings.set(person, null);
			});
		}
	}

	set(giver, receiver) {
		this.givings.set(giver, receiver);
		return this;
	}

	getReceiverFor(giver) {
		return this.givings.get(giver);
	}

	getMatchCount(otherSet) {
		const others = otherSet.givings;
		let count = 0;

		for (let giver of others.keys()) {
			const receiver = others.get(giver);
			let currentReceiver = this.getReceiverFor(giver);
			if (currentReceiver && currentReceiver === receiver) {
				count++;
			}
		}

		return count;
	}

	clone() {
		const cloned = new GivingSet();
		for (let [ giver, receiver ] of this.givings) {
			cloned.set(giver, receiver);
		}

		return cloned;
	}

	static generate(people, rules, giving, matches, depth) {
		depth = depth || 0;
		matches = matches || [];
		const prefix = ' '.repeat(depth);

		function log(message) {
			debug && console.log(prefix + message);
		}

		for (let [ giver, receiver ] of giving.givings) {
			if (receiver) {
				continue;
			}

			log('trying to assign a receiver to ' + lliw.blue(giver.name));
			//go through each receiver, and try to set them up with the giver
			for (let i = 0; i < people.length; i++) {
				let person = people[i];
				log('making ' + lliw.blue(giver.name) + ' give to ' + lliw.yellow(person.name));
				giving.set(giver, person);

				//validate ruleset
				let invalidRule;
				const isValid = rules.every(rule => {
					if (!rule.isValid(giving)) {
						invalidRule = rule;
						return false;
					}

					return true;
				});

				if (isValid) {
					if (GivingSet.generate(people, rules, giving, matches, depth + 1)) {
						//it worked!
						log(lliw.green('found a match!'));
						matches.push(giving.clone());
					}

					giving.set(giver, null);
				} else {
					//this guy is not great, go on the next one
					log('> that didn\'t work because ' + lliw.red(invalidRule.name) + ' failed');
					giving.set(giver, null);
				}
			}

			if (!giving.getReceiverFor(giver)) {
				return false;
			}
		}

		//if we got here, worked!
		return true;
	}

	toStringWithHeader(header) {
		header = String(header || '');
		const delimiter = ' gives to ';
		const padding = ' ';
		const colChar = '|';
		const cornerChar = '+';
		const rowChar = '-';

		let longestNameLength = header ? header.length : 0;

		for (let [ giver, receiver ] of this.givings) {
			longestNameLength = Math.max(
				longestNameLength,
				giver.name.length + delimiter.length + receiver.name.length
			);
		}

		const innerRowLength = longestNameLength + (padding.length * 2);
		const lines = [];

		const fullRow = cornerChar + rowChar.repeat(innerRowLength) + cornerChar;
		if (header) {
			lines.push(fullRow);
			lines.push(
				colChar + padding +
				lliw.green(header) +
				padding.repeat(longestNameLength - header.length + 1) + colChar
			);
		}

		lines.push(fullRow);
		for (let [ giver, receiver ] of this.givings) {
			const dataPadding = longestNameLength - (giver.name.length + receiver.name.length + delimiter.length);
			lines.push(
				colChar + padding +
				lliw.blue(giver.name) + delimiter + lliw.yellow(receiver.name) +
				padding.repeat(dataPadding + 1) + colChar
			);
		}

		lines.push(fullRow);

		return lines.join('\n');
	}

	toString() {
		return this.toStringWithHeader();
	}
}

class GivingRule {
	get name() {
		return 'default';
	}

	isValid() {
		return true;
	}
}

class BlacklistRule extends GivingRule {
	constructor(blacklist) {
		super();
		this.blacklist = blacklist;
	}

	get name() {
		return 'blacklist';
	}

	isValid(giving) {
		for (let [ giver, blacklisted ] of this.blacklist) {
			let receiver = giving.getReceiverFor(giver);
			if (receiver === blacklisted) {
				return false;
			}
		}

		return true;
	}
}

class MaxMatchesRule extends GivingRule {
	constructor(givingSet, maxMatches) {
		super();
		this.givingSet = givingSet;
		this.maxMatches = maxMatches;
	}

	get name() {
		return 'max matches (' + this.maxMatches + ')';
	}

	isValid(giving) {
		return giving.getMatchCount(this.givingSet) <= this.maxMatches;
	}
}

class UniqueReceiverRule extends GivingRule {
	get name() {
		return 'unique receiver';
	}

	isValid(giving) {
		const receivers = [];
		for (const [ giver, receiver ] of giving.givings) {
			if (!receiver) {
				continue;
			}

			if (receivers.indexOf(receiver) !== -1) {
				return false;
			}

			receivers.push(receiver);
		}

		return true;
	}
}

class CannotGiveToSelfRule extends GivingRule {
	get name() {
		return 'identity';
	}

	isValid(giving) {
		for (let [ giver, receiver ] of giving.givings) {
			if (giver === receiver) {
				return false;
			}
		}

		return true;
	}
}

const bob = new Person('Bob');
const joe = new Person('Joe');
const rebecca = new Person('Rebecca');
const gigi = new Person('Gigi');
const tommy = new Person('Tommy');
const previousGivings = new Map();
previousGivings.set(2013, new GivingSet()
	.set(bob, gigi)
	.set(joe, rebecca)
	.set(rebecca, joe)
	.set(gigi, tommy)
	.set(tommy, bob)
);
previousGivings.set(2014, new GivingSet()
	.set(bob, joe)
	.set(joe, bob)
	.set(rebecca, tommy)
	.set(gigi, rebecca)
	.set(tommy, gigi)
);
previousGivings.set(2015, new GivingSet()
	.set(bob, tommy)
	.set(joe, rebecca)
	.set(rebecca, gigi)
	.set(gigi, bob)
	.set(tommy, joe)
);
previousGivings.set(2016, new GivingSet()
	.set(bob, gigi)
	.set(joe, bob)
	.set(rebecca, joe)
	.set(gigi, tommy)
	.set(tommy, rebecca)
);
previousGivings.set(2017, new GivingSet()
	.set(bob, joe)
	.set(joe, tommy)
	.set(rebecca, gigi)
	.set(gigi, rebecca)
	.set(tommy, bob)
);
previousGivings.set(2018, new GivingSet()
	.set(bob, gigi)
	.set(joe, rebecca)
	.set(rebecca, tommy)
	.set(gigi, bob)
	.set(tommy, joe)
);
previousGivings.set(2019, new GivingSet()
	.set(bob, tommy)
	.set(joe, bob)
	.set(rebecca, joe)
	.set(gigi, rebecca)
	.set(tommy, gigi)
);
previousGivings.set(2020, new GivingSet()
	.set(bob, joe)
	.set(joe, rebecca)
	.set(rebecca, gigi)
	.set(gigi, tommy)
	.set(tommy, bob)
);
previousGivings.set(2021, new GivingSet()
	.set(bob, gigi)
	.set(joe, tommy)
	.set(rebecca, joe)
	.set(gigi, bob)
	.set(tommy, rebecca)
);

const currentYear = 2022;

const rules = [
	new CannotGiveToSelfRule(),
	new BlacklistRule(new Map([
		[bob, rebecca],
		[rebecca, bob],
		[joe, gigi],
		[gigi, joe]
	])),
	new UniqueReceiverRule(),
	new MaxMatchesRule(previousGivings.get(currentYear - 1), 0),
	new MaxMatchesRule(previousGivings.get(currentYear - 2), 1)
];

const people = [bob, joe, rebecca, gigi, tommy];
const newGivingSet = new GivingSet(people);
const matches = [];
GivingSet.generate(people, rules, newGivingSet, matches);
console.log(previousGivings.get(currentYear - 3).toStringWithHeader(currentYear - 3));
console.log(previousGivings.get(currentYear - 2).toStringWithHeader(currentYear - 2));
console.log(previousGivings.get(currentYear - 1).toStringWithHeader(currentYear - 1));

console.log();
if (matches.length) {
	matches.forEach((givingSet, i) => {
		console.log('Match #' + (i + 1));
		console.log(givingSet.toStringWithHeader(currentYear));
	});
} else {
	console.log(lliw.red('No matches found :('));
}
