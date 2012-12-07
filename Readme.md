## cubby

a cubby that uses mysql (there is also a [flat file version](https://github.com/icodeforlove/node-cubby))

works well as a simple json datastore

## installation

    $ npm install mysql-cubby

## usage

```javascript
var mysql = require('mysql'),
	Cubby = require('mysql-cubby'),
	connection = mysql.createConnection({
		/* connection info*/
	});

connection.connect();

var cubby = new Cubby({connection: connection /*, table: '', name: ''*/});

cubby.load(function () {
	cubby.set('foo', 'bar');
	console.log(cubby.get('foo'));
});
```

or

```javascript
cubby.load(function () {
	cubby.set({
		one: 'one',
		two: 'two',
		three: {
			nested: true
		}
	});

	console.log(cubby.get('one')); // returns one
	console.log(cubby.getPath('three.nested')); // returns true
});
```

## multiple cubbies

by default creating a cubby will result in a cubby table with a row named default, you may override them like this

```javascript
var cubbyOne = new Cubby({connection: connection, table: 'datastore', name: 'one'}),
	cubbyTwo = new Cubby({connection: connection, table: 'datastore', name: 'two'});
```

## paths

```javascript
cubby.setPath('one.two.three', true);
cubby.getPath('one.two.three');
cubby.getPath('one.two.three.four'); // returns undefined when value doesn't exist
```