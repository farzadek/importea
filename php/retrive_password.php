<?php
$id = $_GET["c"];
//$email_to_manager = 'info.greenportal@gmail.com';
$email = $_GET["e"];
$message = "<h4>GreenPortal</h4>".
           "<p><strong>Password recovery, Click on link please.</strong></p>".
           "<a href='http://localhost/greemportal/php/rp.php?o=".$id."' target='_blank'>http://farzadkamali.000webhostapp.com/greenportal/php/rp.php?o=".$id."</a>";

?>