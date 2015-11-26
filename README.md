# Christmas Giving
This is a little script that will generate Christmas giving rotations
for my brothers and sisters-in-law. The rules are thus:

1. Cannot give to the same person you gave to last year
2. Married people cannot give to each other

## Usage
First run `npm install`, and then do this:

```
$ npm start
  
> xmas@2.0.0 start /home/tmont/code/xmas
> node --use_strict --harmony_destructuring --harmony xmas.js

+----------------------+
| 2013                 |
+----------------------+
| Bob gives to Gigi    |
| Joe gives to Rebecca |
| Rebecca gives to Joe |
| Gigi gives to Tommy  |
| Tommy gives to Bob   |
+----------------------+
+------------------------+
| 2014                   |
+------------------------+
| Bob gives to Joe       |
| Joe gives to Bob       |
| Rebecca gives to Tommy |
| Gigi gives to Rebecca  |
| Tommy gives to Gigi    |
+------------------------+

Match #1
+-----------------------+
| 2015                  |
+-----------------------+
| Bob gives to Tommy    |
| Joe gives to Rebecca  |
| Rebecca gives to Gigi |
| Gigi gives to Bob     |
| Tommy gives to Joe    |
+-----------------------+
```
## Brief Explanation
This uses a backtracking algorithm to find all possible solutions that
match all the rules. The code isn't super great, but it appears to work.
And looking good is better than feeling good.

There are several rules:

1. A "blacklist" rule, that prevents Bob/Rebecca and Joe/Gigi from giving to each other
   (because they are married, which would be boring)
2. A "unique receiver" rule that prevents somebody from receiving a gift from two
   different people
3. An "identity" rule that prevents somebody from giving a gift to themselves
4. A "maximum matches (0)" rule that ensures that at most zero people are giving to
   the same people they gave to the previous year
4. A "maximum matches (1)" rule that ensures that at most one person is giving to
   the same person they gave to two years ago
   
Only the calling code is hardcoded to my family; the "framework" can be handle an
arbitrary number of people. Plus it's easy to write your own rules!

### PHP?
I wrote the original version in 2009 in PHP 5.2 (no closures). It's garbage and
kind of embarrassing, but I'm a sentimentalist, so it's included in this
repository as a monument to the `global` keyword in PHP. Don't write code like that,
kids.
