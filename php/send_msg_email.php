<?php
$msg = $_GET["msg"];
$email_to_manager = 'info.greenportal@gmail.com';
if(mail($email_to_manager,"Mesage Received!",$msg)){
    echo true;
}

?>