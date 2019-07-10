<?php
$name = '';
if(!empty($_FILES)){
    $name = $_GET['name'];
    $ext = pathinfo($_FILES["file"]["name"])['extension'];
    $path = './../images/docs/'.$name.'.'.$ext;
    if(move_uploaded_file($_FILES['file']['tmp_name'], $path)){
        echo $ext;
    }
    else{
        echo 'ERR';
    }
    $_FILES = [];
} else{
    echo 'ERROR from PHP';
}
?>