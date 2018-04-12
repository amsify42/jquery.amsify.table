Amsify Jquery Table
-------------------

## Requires
1. [AmsifyHelper](https://github.com/amsify42/jquery.amsify.helper)
2. Jquery-ui(If draggable sort option is being used)

This is a plugin for rendering inputs in table columns and call ajax on search/sort rows by column names.
```html
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Email</th>
				<th>Phone</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Patrick</td>
				<td>patrick@mail.com</td>
				<td>123123123</td>
			</tr>
			<tr>
				<td>John</td>
				<td>john@mail.com</td>
				<td>42424242</td>
			</tr>
		</tbody>
	</table>
```

After plugin initialization, one more row will be added with inputs just below the first row of **thead**
```js
	$('table').amsifyTable({
		searchAction : 'http://site.com/search'
	});
```

Sort icons will also be rendered with click event. Onclick ajax will be called with column name, sort type and column input.
<br/>

For making the table rows draggable sort, you can also set its action in table attribute
```html
	<table drag-sortable="http://site.com/sort">
		<thead>
			...
		</thead>
		<tbody>
			...
		</tbody>
	</table>
```
