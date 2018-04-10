<?php

$rows 		= '';	 
for($i=1; $i <= 5; $i++) {
	$page 	= (isset($_POST['page']))? $_POST['page']: 1;
	$rows 	.= '<tr>
					<td>name'.($i*$page).'</td>
					<td>Active</td>
					<td>name'.($i*$page).'@email.com</td>
				</tr>';
}

$pagination = '<ul class="pagination">';
for($i=1; $i <= 3; $i++) { 
	$active 	= (isset($_POST['page']) && $_POST['page'] == $i)? 'active': '';
	$pagination .= '<li class="page-item '.$active.'"><a data-page="'.$i.'" class="page-link amsify-sort-paginate" href="#">'.$i.'</a></li>';
}										
$pagination .= '</ul>';

header('Content-type: application/json');
echo json_encode(array(
						'status' 	=> true,
						'message' 	=> 'Sort Successful',
						'html' 		=> $rows,
						'pagination'=> $pagination,				
					));