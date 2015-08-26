<?php

$authorCache = array();

main();

function main() {

    $token = "fb6c27928d83f8ea6a9565e0f008cceffee83af1";
    //$token2 = "fbceba186a66e9e8434ede8a5ac03d32c99be19f"; //Miguelcldn token (only for testing!)

    $url = "https://api.github.com/repos/bitDubai/fermat/contents/FermatManifest.xml";
    
    $data = askGitHub($url);
    
    $data = $data["content"];
    $data = str_replace('', '\n', $data);
    $data = base64_decode($data);

    $data = simplexml_load_string($data);



    //$data = $data->fermat;

    $platformList = [];
    $layerList = [];
    $pluginList = [];
    $superLayerList = [];

    $layerIndex = 0;
    $platformIndex = 0;
    $superLayerIndex = 0;

    foreach($data->platforms->children() as $platform) {

        array_push($platformList, array(
            'code' => strval($platform['code']),
            'name' => strval($platform['name']),
            'logo' => strval($platform['logo']),
            'index' => $platformIndex
        ));
        $platformIndex++;

        foreach($platform->children() as $layer) {

            if( searchName(strval($layer['name']), $layerList) === false) {

                array_push($layerList, array( 'name' => strval($layer['name']), 'index' => $layerIndex, 'super_layer' => false));
                $layerIndex++;
            }

            if(isset($layer['super_layer'])) {
                
                foreach($data->super_layers->children() as $super_layer) {
                    
                    if( search('code', strval($super_layer['code']), $superLayerList) === null) {

                        array_push($superLayerList, array( 
                            'name' => strval($super_layer['name']),
                            'code' => strval($super_layer['code']),
                            'index' => $superLayerIndex,
                        ));
                        
                        $superLayerIndex++;
                    }

                    if(strval($super_layer['code']) === strval($layer['super_layer'])) {

                        foreach($super_layer->children() as $sub_superLayer) {
                            
                            if( searchName(strval($sub_superLayer['name']), $layerList) === false) {

                                array_push($layerList, array( 'name' => strval($sub_superLayer['name']), 'index' => $layerIndex, 'super_layer' => true));
                                $layerIndex++;
                            }

                            if($sub_superLayer->androids) {
                                foreach($sub_superLayer->androids->children() as $android) {
                                    
                                $newElement = createElement($android, 'Android', $sub_superLayer);
                                array_push($pluginList, $newElement);
                                }
                            }

                            if($sub_superLayer->plugins) {
                                foreach($sub_superLayer->plugins->children() as $plugin) {

                                $newElement = createElement($plugin, 'Plugin', $sub_superLayer);
                                array_push($pluginList, $newElement);
                                }
                            }

                            if($sub_superLayer->addons) {
                                foreach($sub_superLayer->addons->children() as $addon) {
                                    
                                    $newElement = createElement($addon, 'Addon', $sub_superLayer);
                                    array_push($pluginList, $newElement);
                                }
                            }
                            
                            if($sub_superLayer->libraries) {
                                foreach($sub_superLayer->libraries->children() as $library) {
                                    
                                    $newElement = createElement($library, 'Library', $sub_superLayer);
                                    array_push($pluginList, $newElement);
                                }
                            }
                        }
                    }
                }
            }
            else {

                if($layer->androids) {
                    foreach($layer->androids->children() as $android) {
                        
                    $newElement = createElement($android, 'Android', $layer, $platform);
                    array_push($pluginList, $newElement);
                    }
                }

                if($layer->plugins) {
                    foreach($layer->plugins->children() as $plugin) {

                        $newElement = createElement($plugin, 'Plugin', $layer, $platform);
                        array_push($pluginList, $newElement);
                    }
                }

                if($layer->addons) {
                    foreach($layer->addons->children() as $addon) {
                        
                    $newElement = createElement($addon, 'Addon', $layer, $platform);
                    array_push($pluginList, $newElement);
                    }
                }
                
                if($layer->libraries) {
                    foreach($layer->libraries->children() as $library) {

                        $newElement = createElement($library, 'Library', $layer, $platform);
                        array_push($pluginList, $newElement);
                    }
                }
            }
        }
    }

    $result = array(
        'groups' => $platformList,
        'layers' => $layerList,
        'plugins' => $pluginList,
        'superLayers' => $superLayerList
        );

    echo json_encode($result);
}

//=======================================================================================================================

function searchName($name, $list) {
    
    foreach($list as $element) {
        if($element['name'] === $name) return true;
    }
    
    return false;
}

function lookForAuthor($element) {
    
    $author = null;
    global $authorCache;
    
    $userUrl = "https://api.github.com/users/";
    
    if(!$element->authors) return null;
    
    foreach($element->authors->children() as $actual) {
        
        if( strval($actual['scope']) === 'implementation' ) {
            
            if($author == null || $author['percentage'] < (int)strval($actual['percentage'])) {
                
                $author = array(
                    'name' => strval($actual['name']),
                    'percentage' => (int)strval($actual['percentage'])
                    );
                
                $cache = search('name', $author['name'], $authorCache);
                
                if ( $cache === null ) {
                    
                    $userData = askGitHub($userUrl . $author['name']);
                    $pictureUrl = $userData["avatar_url"];
                    
                    array_push( $authorCache, array(
                        'name' => $author['name'],
                        'img' => $userData['avatar_url']
                    ));
                }
                else {
                    $pictureUrl = $cache['img'];
                }
                
                $author['picture'] = $pictureUrl;
            }
        }
    }
    
    return $author;
}

function askGitHub($url) {
    
    $token = "fb6c27928d83f8ea6a9565e0f008cceffee83af1";
    $url = $url . "?access_token=$token";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'User-Agent: MALOTeam',
        //'User-Agent: Miguelcldn', //For testing
        'Accept: */*'
    ));
    $data = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($data, true);
}

function search($attr, $element, $list) {
    
    foreach($list as $current) {
        if($current[$attr] === $element) return $current;
    }
    
    return null;
}

function createElement($element, $type, $layer, $platform = null) {
    
    if ( $element['name'] == null ) return null;
    
    $newElement = array(
        'name' => strval($element['name']),
        'description' => strval($element['description']),
        'code_level' => strval($element['code-level']),
        'layer' => strval($layer['name']),
        'difficulty' => (int)strval($element['difficulty']),
        'type' => $type
        );
    
    
    if ( $platform != null) $newElement['group'] = strval($platform['code']);
    
    $author = lookForAuthor($element);

    if($author != null) {

        $newElement['authorName'] = strval($author['name']);
        $newElement['authorPicture'] = strval($author['picture']);
    }
    
    return $newElement;
}

?>