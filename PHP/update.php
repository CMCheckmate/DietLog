<?php
    // Database information
    $db_hostname = "nimbus.rangitoto.school.nz";
    $db_port = "3307";
    $db_user = "2022164099";
    $db_password = "susboi123";
    $db_name = "student2022164099";
    $record_db = "record_table";
    $food_db = "food_table";

    $food_type_db = "food_type_table";
    $meal_db = "meal_table";
    $food_combo_db = "food_combo_table";
    $food_type_combo_db = "food_type_combo_table";

    $conn = new mysqli($db_hostname, $db_user, $db_password, $db_name, $db_port);

    // Text delimiting character
    $info_delimiter = "|";

    // Submitted Data
    $action = $_POST["recordForm"];
    $record_id = $_POST["recordId"];
    $user_id = $_POST["userId"];
    $foods = explode($info_delimiter, $_POST["Food"]);
    $food_types = $_POST["foodTypes"];
    $date = $_POST["Date"];
    $meal = $_POST["Meal"];

    // Delete records
    if ($action == "delete") {
        $stmt = $conn->prepare("DELETE FROM $db_name.$record_db WHERE record_id=?;");
        $stmt->bind_param("s", $record_id);
        $stmt->execute();
    } else {
        // Update main table record details upon change from edit
        if ($action == "edit") {
            $stmt = $conn->prepare("UPDATE $db_name.$record_db SET date=?, meal_id=(SELECT meal_id FROM $db_name.$meal_db WHERE meal_name=?) WHERE record_id=?");
            $stmt->bind_param("sss", $date, $meal, $record_id);
            $stmt->execute();
        // Add meal record if not exists for entry
        } else {
            $stmt = $conn->prepare("INSERT INTO $db_name.$record_db (user_id, date, meal_id) SELECT ?, ?, meal_id FROM $db_name.$meal_db WHERE meal_name=? ON DUPLICATE KEY UPDATE user_id=user_id;");
            $stmt->bind_param("sss", $user_id, $date, $meal);
            $stmt->execute();
            $record_id = mysqli_insert_id($conn);
        }
        
        // Delete existing food and food type combinations that have been edited out
        if ($action == "edit") {
            $food_strs = "s" . str_repeat("s", count($foods));
            $food_params = rtrim(str_repeat("?, ", count($foods)), ", ");
            $stmt = $conn->prepare("DELETE FROM $db_name.$food_combo_db WHERE record_id=? AND food_id NOT IN (SELECT food_id FROM $db_name.$food_db WHERE food_name IN ($food_params));");
            $stmt->bind_param($food_strs, $record_id, ...$foods);
            $stmt->execute();
    
            $food_type_strs = "s" . str_repeat("s", count($food_types));
            $food_type_params = rtrim(str_repeat("?, ", count($food_types)), ", ");
            $stmt = $conn->prepare("DELETE FROM $db_name.$food_type_combo_db WHERE record_id=? AND food_type_id NOT IN (SELECT food_type_id FROM $db_name.$food_type_db WHERE food_type IN ($food_type_params));");
            $stmt->bind_param($food_type_strs, $record_id, ...$food_types);
            $stmt->execute();
        }
        
        if ($record_id != 0) {
            // Add new foods to food table
            $food_strs = str_repeat("s", count($foods));
            $food_params = rtrim(str_repeat("(?), ", count($foods)), ", ");
            $stmt = $conn->prepare("INSERT INTO $db_name.$food_db (food_name) VALUES $food_params ON DUPLICATE KEY UPDATE food_name=food_name;");
            $stmt->bind_param($food_strs, ...$foods);
            $stmt->execute();
        
            // Add food combination for record
            $food_params = rtrim(str_repeat("?, ", count($foods)), ", ");
            $stmt = $conn->prepare("INSERT INTO $db_name.$food_combo_db (record_id, food_id) SELECT '$record_id', food_id FROM $db_name.$food_db WHERE food_name IN ($food_params) ON DUPLICATE KEY UPDATE record_id=record_id;");
            $stmt->bind_param($food_strs, ...$foods);
            $stmt->execute();
        
            // Add food type combination for record
            $food_type_strs = str_repeat("s", count($food_types));
            $food_type_params = rtrim(str_repeat("?, ", count($food_types)), ", ");
            $stmt = $conn->prepare("INSERT INTO $db_name.$food_type_combo_db (record_id, food_type_id) SELECT '$record_id', food_type_id FROM $db_name.$food_type_db WHERE food_type IN ($food_type_params) ON DUPLICATE KEY UPDATE record_id=record_id;");
            $stmt->bind_param($food_type_strs, ...$food_types);
            $stmt->execute();
        } else {
            echo "<script>alert('Record with same meal time already exists. Edit existing record instead.')</script>";
        }
    }

    echo "<script>sessionStorage.setItem('records', 'updated')</script>";
    echo "<script>sessionStorage.setItem('action', 'record')</script>";

    mysqli_close($conn);

    // Return to main page
    echo "<script>window.history.go(-1)</script>";
?>
