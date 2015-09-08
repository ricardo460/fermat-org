<?php

function askGitHub($url) {
    
    $token = "fb6c27928d83f8ea6a9565e0f008cceffee83af1";
    $url = $url . "?access_token=$token";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    //Uncomment below if testing locally
    //curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'User-Agent: MALOTeam',
        'Accept: */*'
    ));
    $data = curl_exec($ch);
    
    if ( $data === false ) echo 'Curl error: ' . curl_error($ch);
    
    curl_close($ch);
    
    return json_decode($data, true);
}

function search($attr, $element, $list) {
    
    foreach($list as $current) {
        if($current[$attr] === $element) return $current;
    }
    
    return null;
}

function parseRepoXML() {
    
    $url = "https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml";
    
    $data = askGitHub($url);
    
    $data = $data["content"];
    $data = str_replace('', '\n', $data);
    $data = base64_decode($data);

    $data = simplexml_load_string($data);
    
    return $data;
}

?>