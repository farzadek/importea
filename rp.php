<?php
$id = $_GET["o"];
$dbApiKey = "JIZlGld1NOk4SsznMiAvb78pr7zzAjom";
$url = 'https://api.mlab.com/api/1/databases/greenportal/collections/users/'.$id.'?apiKey='.$dbApiKey;
$json = file_get_contents($url);
$user = json_decode($json, true);

$err = $msg ='';
$ps1 = $ps2 = '';
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST["ps1"])) {
      $err = "Password is required";
    } else {
      $ps1 = $_POST["ps1"];
    }
    $ps2 = $_POST["ps2"];
    if($ps1!=$ps2){
        $err = "Passwords are not match!";
    }

    if(!$err){
        $user = json_encode(array('$set'=>array('password'=>$ps1)));
        $opt = array('http'=>array('method'=>'PUT','header'=>'Content-type: application/json','content'=>$user));
        $context = stream_context_create($opt);
        $returnVal = file_get_contents($url, false, $context);
        $msg = 'Password successfuly changed!';
    }
}
?>
<!DOCTYPE HTML>
<html>
    <style>
        form{
            margin: 10% auto;
            display: table;
        }
        img{
            display: block;
            margin: 0 auto 2em;
        }
        h3, h4{
            text-align: center;
        }
        h4{
            color: green;
        }
        input[type=password]{
            font-size: 1.25em;
            font-weight: 400;
            display: block;
            width: 100%;
            height: 1em;
            padding: 6px 3px;
            line-height: 1.42857143;
            color: #555;
            background-color: #fff;
            background-image: none;
            border: 1px solid #ccc;
            border-radius: 4px;
            -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
            box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
            -webkit-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
            -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
            -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
            transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
            transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
            transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
        }
        label{
            margin-bottom: 2px;
        }
        input[type=submit]{            
            display: block;
            margin: 0 auto;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -ms-touch-action: manipulation;
            touch-action: manipulation;
            cursor: pointer;
            background-image: none;
            border: 1px solid transparent;
            padding: 6px 12px;
            font-size: 14px;
            line-height: 1.42857143;
            border-radius: 4px;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            color: #fff;
            background-color: #337ab7;
            border-color: #2e6da4;
        }
        p{
            color: red;
        }
    </style>  
    <body>

    <form method="post" action="<?php echo $_SERVER['PHP_SELF'].'?o='.$id; ?>">
        <img src="images/logo.png">
        <h3>Password Recovery System</h3>
        <label>New Password:</label> <input type="password" name="ps1"><br>
        <label>Confirm Password:</label> <input type="password" name="ps2"><br>
        <input type="submit">
        <p><?php echo $err; ?></p> 
        <h4><?php echo $msg; ?></h4>
    </form>

    </body>
</html>