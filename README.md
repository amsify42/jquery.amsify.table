# Amsify Jquery Table
This a Jquery plugin for tables which can be use for sorting tables through Ajax request and by searching with column inputs.

#### Requires
1. **jquery.js** library
2. **jquery.amsify.helper.js** file which is there in my **jquery.amsify.helper** repository

This is the way you can initialize it.
```js
  $('table').amsifyTableSort();
``` 
As you can see the selector is **table**, you can also the following option if you are using bootstrap or materialize css framework

```js
  $('table').amsifyTableSort({
    type : 'bootstrap'
  });
``` 

If you want to sort the table by calling ajax
```html
  <table data-method="http://site.com/sort-table">
    <thead>
      <tr>
        <th><a class="amsify-sort-table">Id</a></th>
        <th><a class="amsify-sort-table">Name</a></th>
        <th><a class="amsify-sort-table">Active</a></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Amsify</td>
        <td>YES</td>
      </tr>
    </tbody>
  </table>
  
  <h2>Pagination</h2>
  <div id="pagination">
    <ul>...</ul>
  </div>
  
```
Note all these following things
1. data-method attribute in table
2. **amsify-sort-table** in anchor tags of **thead > tr > th** elements
3. div tag with id **pagination**

### Explanation
1. This will generate one more row at top of the table with inputs to search these columns and sort icons with click events. When clicked or searched it will call ajax method mentioned in **data-method** attribute.
<br/>
2. Json response should be array with status, html containing list of table rows and pagination links if required. Below is the json response example.
```js
  {
    status : 'success',
    html : '<tr>..</tr> <tr>..</tr>',
    links: '<li>..</li> <li>..</li>',
  }
```
If you want some other inputs in table head row instead of input type text, you can do like this
```html
  <table data-method="http://site.com/sort-table">
    <thead>
      <tr>
        <th><a class="amsify-sort-table">Id</a></th>
        <th><a class="amsify-sort-table">Name</a></th>
        <th><a class="amsify-sort-table" selecthtml="#active-options">Active</a></th>
      </tr>
    </thead>
    <tbody>
      ...
    </tbody>
  </table>

  <div id="active-options">
    <select>
      <option value="1">YES</option>
      <option value="0">NO</option>
    </select>
  </div>
  ```
As you can see in the third element of thead, We have added **selecthtml** attribute which will have selector of html content that will be loaded instead of input type text.
  
