<?php

	global $previousGiving, $people, $blacklist;

	$people         = array('bob', 'joe', 'rebecca', 'gigi', 'tommy');
	$previousGiving = array(
		2006 => array(
			$people[0] => $people[4],
			$people[1] => $people[2],
			$people[2] => $people[1],
			$people[3] => $people[0],
			$people[4] => $people[3]
		),
		2007 => array(
			$people[0] => $people[1],
			$people[1] => $people[4],
			$people[2] => $people[3],
			$people[3] => $people[2],
			$people[4] => $people[0]
		),
		2008 => array(
			$people[0] => $people[3],
			$people[1] => $people[0],
			$people[2] => $people[1],
			$people[3] => $people[4],
			$people[4] => $people[2]
		),
		2009 => array(
			$people[0] => $people[1],
			$people[1] => $people[2],
			$people[2] => $people[4],
			$people[3] => $people[0],
			$people[4] => $people[3]
		),
		2010 => array(
			$people[0] => $people[3],
			$people[1] => $people[0],
			$people[2] => $people[1],
			$people[3] => $people[4],
			$people[4] => $people[2]
		),
		2011 => array(
			$people[0] => $people[4],
			$people[1] => $people[2],
			$people[2] => $people[3],
			$people[3] => $people[0],
			$people[4] => $people[1]
		),
		2012 => array(
			$people[0] => $people[1],
			$people[1] => $people[0],
			$people[2] => $people[4],
			$people[3] => $people[2],
			$people[4] => $people[3]
		),
		2013 => array(
			$people[0] => $people[3],
			$people[1] => $people[2],
			$people[2] => $people[1],
			$people[3] => $people[4],
			$people[4] => $people[0]
		),
		2014 => array(
			$people[0] => $people[1],
			$people[1] => $people[0],
			$people[2] => $people[4],
			$people[3] => $people[2],
			$people[4] => $people[3]
		)
	);

	$blacklist = array(
		$people[0] => $people[2],  //bob can't give to rebecca
		$people[1] => $people[3],  //joe can't give to gigi
		$people[2] => $people[0],  //rebecca can't give to bob
		$people[3] => $people[1]   //gigi can't give to joe
	);

	function doStuff(array $actualGiving, $currentGiverIndex, $currentReceiverIndex, &$year) {
		global $people, $previousGiving;

		if ($currentGiverIndex === count($people)) {
			//valid solution
			$previousGiving[$year++] = $actualGiving;
			printGiving($year - 1, $actualGiving);
			return;
		}

		$numPeople = count($people);
		for ($i = $currentGiverIndex; $i < $numPeople; ++$i) {
			for ($j = $currentReceiverIndex; $j < $numPeople; ++$j) {
				$actualGiving[$people[$i]] = $people[$j];
				if (givingIsValid($actualGiving, $year)) {
					doStuff($actualGiving, $currentGiverIndex + 1, 0, $year);
				} else {
					$actualGiving[$people[$i]] = null;
				}
			}

			//not a solution, suck it!
			if ($actualGiving[$people[$i]] === null) {
				break;
			}
		}
	}

	function givingIsValid(array $giving, $year) {
		global $blacklist, $previousGiving;

		$everyoneIsRepresentedInTheGivingArray = in_array(null, $giving);

		$receivers = array();
		foreach ($giving as $giver => $receiver) {
			//each person should only be receiving one gift
			//this just improves performance by short-circuiting the recursion
			if ($receiver !== null) {
				if (in_array($receiver, $receivers)) {
					return false;
				}

				$receivers[] = $receiver;
			}

			//check to see if each person is receiving exactly once
			//check to see if they are giving to themselves
			if ($giver === $receiver || (!$everyoneIsRepresentedInTheGivingArray && count(array_keys($giving, $receiver)) !== 1)) {
				return false;
			}

			//check the blacklist
			foreach ($blacklist as $person => $personTheyAreNotAllowedToGiveTo) {
				if ($giver === $person && $receiver === $personTheyAreNotAllowedToGiveTo) {
					return false;
				}
			}

			//make sure the giver doesn't give to the same person two years in a row
			if ($previousGiving[$year - 1][$giver] === $receiver) {
				return false;
			}
		}

		return true;
	}

	function printGiving($year, array $giving) {
		echo '+' . str_repeat('-', 25) . "\n";
		echo '| ' . $year . "\n";
		echo '+' . str_repeat('-', 25) . "\n";
		foreach ($giving as $giver => $receiver) {
			echo '|' . $giver . ' gives to ' . $receiver . "\n";
		}
		echo '+' . str_repeat('-', 25) . "\n";
		echo "\n";
	}

	$initialGiving = array_fill_keys($people, null);
	$year = date('Y');
	printGiving(date('Y') - 1, $previousGiving[date('Y') - 1]);
	doStuff($initialGiving, 0, 0, $year);

?>
