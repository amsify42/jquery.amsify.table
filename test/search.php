<?php

header('Content-type: application/json');
echo json_encode(array(
						'status' 	=> true,
						'message' 	=> 'Sort Successful',
						'html' 		=> '<tr>
											<td>name2</td>
											<td>Active</td>
											<td>name2@email.com</td>
										</tr>
										<tr>
											<td>name3</td>
											<td>Inactive</td>
											<td>name3@email.com</td>
										</tr>'
					));