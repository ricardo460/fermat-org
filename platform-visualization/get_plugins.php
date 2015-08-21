<?php

$token = "fb6c27928d83f8ea6a9565e0f008cceffee83af1";
$token2 = "fbceba186a66e9e8434ede8a5ac03d32c99be19f"; //Miguelcldn token (only for testing!)

$url = "https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml?access_token=$token"; //https://raw.githubusercontent.com/bitDubai/fermat/master/FermatManifest.xml?token=AFSZSl7cmGtHMYeyFbDE9iSdwU1zjLMKks5V3iyuwA%3D%3D";
$url2 = "https://api.github.com/repos/Miguelcldn/fermat/contents/FermatManifest.xml?access_token=$token2"; //For testing

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url2);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    //'User-Agent: MALOTeam',
    'User-Agent: Miguelcldn', //For testing
    'Accept: */*'
));
$data = curl_exec($ch);
curl_close($ch);

$data = json_decode($data, true);
$data = $data["content"];
$data = str_replace('', '\n', $data);
$data = base64_decode($data);

$data = simplexml_load_string($data);



//$data = $data->fermat;

$columnList = [];
$layerList = [];
$pluginList = [];
$superLayerList = [];

//TODO: Add dificluty, authors

$layerIndex = 0;
$columnIndex = 0;

foreach($data->columns->children() as $column) {
    
    array_push($columnList, array( 'code' => strval($column['code']), 'name' => strval($column['name']), 'index' => $columnIndex));
    $columnIndex++;
    
    foreach($column->children() as $layer) {
        
        if( searchName(strval($layer['name']), $layerList) === false) {
            
            array_push($layerList, array( 'name' => strval($layer['name']), 'index' => $layerIndex));
            $layerIndex++;
        }
        
        if($layer->androids) {
            foreach($layer->androids->children() as $android) {
            
                if( $android['name'] != null) {

                    array_push($pluginList, array(
                        'name' => strval($android['name']),
                        'description' => strval($android['description']),
                        'code-level' => strval($android['code-level']),
                        'layer' => strval($layer['name']),
                        'group' => strval($column['code']),
                        'type' => 'Android'
                        ));
                }

            }
        }
        
        if($layer->plugins) {
            foreach($layer->plugins->children() as $plugin) {

                if( $plugin['name'] != null) {

                    array_push($pluginList, array(
                        'name' => strval($plugin['name']),
                        'description' => strval($plugin['description']),
                        'code-level' => strval($plugin['code-level']),
                        'layer' => strval($layer['name']),
                        'group' => strval($column['code']),
                        'type' => 'Plugin'
                        ));
                }

            }
        }
        
        if($layer->addons) {
            foreach($layer->addons->children() as $addon) {

                if( $addon['name'] != null) {

                    array_push($pluginList, array(
                        'name' => strval($addon['name']),
                        'description' => strval($addon['description']),
                        'code-level' => strval($addon['code-level']),
                        'layer' => strval($layer['name']),
                        'group' => strval($column['code']),
                        'type' => 'Addon'
                        ));
                }

            }
        }
    }
}

$result = array(
    'groups' => $columnList,
    'layers' => $layerList,
    'plugins' => $pluginList,
    'superLayers' => $superLayerList
    );

echo json_encode($result);

//==============================================================================

function searchName($name, $list) {
    
    foreach($list as $element) {
        if($element['name'] === $name) return true;
    }
    
    return false;
}

?>