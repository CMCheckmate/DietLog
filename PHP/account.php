<?php
    // Database information
    $db_hostname = "nimbus.rangitoto.school.nz";
    $db_port = "3307";
    $db_user = "2022164099";
    $db_password = "susboi123";
    $db_name = "student2022164099";
    $user_db = "user_table";

    $conn = new mysqli($db_hostname, $db_user, $db_password, $db_name, $db_port);
    
    // Text delimiting character
    $info_delimiter = "|";

    // Submitted data
    $action = $_POST["accountForm"];
    $username = $_POST["Username"];
    $password = hash("sha256", $_POST["Password"]);
    
    $login = true;
    if ($action == "signup") {
        // Check if user already exists
        $stmt = $conn->prepare("SELECT username FROM $db_name.$user_db WHERE username=?;");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $results = $stmt->get_result();
        $results = mysqli_fetch_assoc($results);

        // Add user to database
        if (empty($results)) {
            $stmt = $conn->prepare("INSERT INTO $db_name.$user_db (username, password) VALUES (?, UNHEX(?));");
            $stmt->bind_param("ss", $username, $password);
            $stmt->execute();
        } else {
            $login = false;
        }
    }

    // Confirm user details from database
    if ($login) {
        $stmt = $conn->prepare("SELECT user_id FROM $db_name.$user_db WHERE username=? and password=UNHEX(?);");
        $stmt->bind_param("ss", $username, $password);
        $stmt->execute();
        $results = $stmt->get_result();
        $results = array_values(mysqli_fetch_assoc($results));

        mysqli_close($conn);

        // Store user information in session storage
        if ($results) {
            $user_id = $results[0];
            $user_information = addslashes($user_id . $info_delimiter . $username);

            echo "<script>sessionStorage.setItem('account', '$user_information')</script>";
            echo "<script>sessionStorage.setItem('action', 'account')</script>";
        // Notify user for incorrect details
        } else {
            echo "<script>alert('Incorrect username and password combination.')</script>";
        }
    } else {
        echo "<script>alert('User already exists. Please enter a different username.')</script>";
    }

    // Return to main page
    echo "<script>window.history.go(-1);</script>";
?>
