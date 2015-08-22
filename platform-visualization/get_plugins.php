<?php

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

                array_push($layerList, array( 'name' => strval($layer['name']), 'index' => $layerIndex, 'super_layer' => false));
                $layerIndex++;
            }

            if(isset($layer['super_layer'])) {

                foreach($data->super_layers->children() as $super_layer) {

                    if(strval($super_layer['code']) === strval($layer['super_layer'])) {

                        foreach($super_layer->children() as $sub_superLayer) {
                            
                            if( searchName(strval($sub_superLayer['name']), $layerList) === false) {

                                array_push($layerList, array( 'name' => strval($sub_superLayer['name']), 'index' => $layerIndex, 'super_layer' => true));
                                $layerIndex++;
                            }

                            if($sub_superLayer->androids) {
                                foreach($sub_superLayer->androids->children() as $android) {

                                    if( $android['name'] != null) {

                                        $newElement = array(
                                            'name' => strval($android['name']),
                                            'description' => strval($android['description']),
                                            'code_level' => strval($android['code-level']),
                                            'layer' => strval($sub_superLayer['name']),
                                            //'group' => strval($column['code']),
                                            'difficulty' => (int)strval($android['difficulty']),
                                            'type' => 'Android'
                                            );

                                        $author = lookForAuthor($android);

                                        if($author != null) {

                                            $newElement['authorName'] = strval($author['name']);
                                            $newElement['authorPicture'] = strval($author['picture']);

                                        }

                                        array_push($pluginList, $newElement);
                                    }
                                }
                            }

                            if($sub_superLayer->plugins) {
                                foreach($sub_superLayer->plugins->children() as $plugin) {

                                    if( $plugin['name'] != null) {

                                        $newElement = array(
                                            'name' => strval($plugin['name']),
                                            'description' => strval($plugin['description']),
                                            'code_level' => strval($plugin['code-level']),
                                            'layer' => strval($sub_superLayer['name']),
                                            //'group' => strval($column['code']),
                                            'difficulty' => (int)strval($plugin['difficulty']),
                                            'type' => 'Plugin'
                                            );

                                        $author = lookForAuthor($plugin);

                                        if($author != null) {

                                            $newElement['authorName'] = strval($author['name']);
                                            $newElement['authorPicture'] = strval($author['picture']);

                                        }

                                        array_push($pluginList, $newElement);
                                    }

                                }
                            }

                            if($sub_superLayer->addons) {
                                foreach($sub_superLayer->addons->children() as $addon) {

                                    if( $addon['name'] != null) {

                                        $newElement = array(
                                            'name' => strval($addon['name']),
                                            'description' => strval($addon['description']),
                                            'code_level' => strval($addon['code-level']),
                                            'layer' => strval($sub_superLayer['name']),
                                            //'group' => strval($column['code']),
                                            'difficulty' => (int)strval($addon['difficulty']),
                                            'type' => 'Addon'
                                            );

                                        $author = lookForAuthor($addon);

                                        if($author != null) {

                                            $newElement['authorName'] = strval($author['name']);
                                            $newElement['authorPicture'] = strval($author['picture']);

                                        }

                                        array_push($pluginList, $newElement);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {

                if($layer->androids) {
                    foreach($layer->androids->children() as $android) {

                        if( $android['name'] != null) {

                            $newElement = array(
                                'name' => strval($android['name']),
                                'description' => strval($android['description']),
                                'code_level' => strval($android['code-level']),
                                'layer' => strval($layer['name']),
                                'group' => strval($column['code']),
                                'difficulty' => (int)strval($android['difficulty']),
                                'type' => 'Android'
                                );

                            $author = lookForAuthor($android);

                            if($author != null) {

                                $newElement['authorName'] = strval($author['name']);
                                $newElement['authorPicture'] = strval($author['picture']);

                            }

                            array_push($pluginList, $newElement);
                        }
                    }
                }

                if($layer->plugins) {
                    foreach($layer->plugins->children() as $plugin) {

                        if( $plugin['name'] != null) {

                            $newElement = array(
                                'name' => strval($plugin['name']),
                                'description' => strval($plugin['description']),
                                'code_level' => strval($plugin['code-level']),
                                'layer' => strval($layer['name']),
                                'group' => strval($column['code']),
                                'difficulty' => (int)strval($plugin['difficulty']),
                                'type' => 'Plugin'
                                );

                            $author = lookForAuthor($plugin);

                            if($author != null) {

                                $newElement['authorName'] = strval($author['name']);
                                $newElement['authorPicture'] = strval($author['picture']);

                            }

                            array_push($pluginList, $newElement);
                        }

                    }
                }

                if($layer->addons) {
                    foreach($layer->addons->children() as $addon) {

                        if( $addon['name'] != null) {

                            $newElement = array(
                                'name' => strval($addon['name']),
                                'description' => strval($addon['description']),
                                'code_level' => strval($addon['code-level']),
                                'layer' => strval($layer['name']),
                                'group' => strval($column['code']),
                                'difficulty' => (int)strval($addon['difficulty']),
                                'type' => 'Addon'
                                );

                            $author = lookForAuthor($addon);

                            if($author != null) {

                                $newElement['authorName'] = strval($author['name']);
                                $newElement['authorPicture'] = strval($author['picture']);

                            }

                            array_push($pluginList, $newElement);
                        }
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
    $userUrl = "https://api.github.com/users/";
    
    if(!$element->authors) return null;
    
    foreach($element->authors->children() as $actual) {
        
        if( strval($actual['scope']) === 'implementation' ) {
            
            if($author == null || $author['percentage'] < (int)strval($actual['percentage'])) {
                
                $author = array(
                    'name' => strval($actual['name']),
                    'percentage' => (int)strval($actual['percentage'])
                    );
                
                $userData = askGitHub($userUrl . $author['name']);
                $pictureUrl = $userData["avatar_url"];
                
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

?>