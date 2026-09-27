<?php

class PersonController
{

    private FileManager $fileManager;

    public function __construct()
    {
        $this->fileManager = new FileManager();
    }

    private function response($data, $code = 200)
    {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }

    public function getAll()
    {
        $this->response($this->fileManager->read());
    }

    public function getById($id)
    {
        $persons = $this->fileManager->read();

        foreach ($persons as $person) {

            if ($person["id"] == $id) {

                $this->response($person);

            }

        }

        $this->response([
            "message"=>"Person not found"
        ],404);

    }

    public function create()
    {

        $persons = $this->fileManager->read();

        $data = json_decode(file_get_contents("php://input"), true);

        if(
            empty($data["name"]) ||
            empty($data["birthday"]) ||
            empty($data["email"])
        ){

            $this->response([
                "message"=>"All fields are required"
            ],400);

        }

        if(!filter_var($data["email"],FILTER_VALIDATE_EMAIL)){

            $this->response([
                "message"=>"Invalid email"
            ],400);

        }

        foreach($persons as $p){

            if($p["email"]==$data["email"]){

                $this->response([
                    "message"=>"Email already exists"
                ],400);

            }

        }

        $date = DateTime::createFromFormat("Y-m-d",$data["birthday"]);

        if(!$date || $date->format("Y-m-d")!=$data["birthday"]){

            $this->response([
                "message"=>"Invalid birthday"
            ],400);

        }

        if($date > new DateTime()){

            $this->response([
                "message"=>"Birthday cannot be future"
            ],400);

        }

        $id = empty($persons)
            ?1
            :max(array_column($persons,"id"))+1;

        $person = new PersonDTO(
            $id,
            $data["name"],
            $data["birthday"],
            $data["email"]
        );

        $persons[] = $person->toArray();

        $this->fileManager->write($persons);

        $this->response($person->toArray(),201);

    }

    public function update($id)
    {

        $persons = $this->fileManager->read();

        $data = json_decode(file_get_contents("php://input"),true);

        foreach($persons as &$person){

            if($person["id"]==$id){

                $person["name"]=$data["name"];
                $person["birthday"]=$data["birthday"];
                $person["email"]=$data["email"];

                $this->fileManager->write($persons);

                $this->response($person);

            }

        }

        $this->response([
            "message"=>"Person not found"
        ],404);

    }

    public function delete($id)
    {

        $persons = $this->fileManager->read();

        $newPersons=[];

        $found=false;

        foreach($persons as $person){

            if($person["id"]==$id){

                $found=true;

            }else{

                $newPersons[]=$person;

            }

        }

        if(!$found){

            $this->response([
                "message"=>"Person not found"
            ],404);

        }

        $this->fileManager->write($newPersons);

        $this->response([
            "message"=>"Person deleted"
        ]);

    }

    public function getAge($id)
    {

        $persons=$this->fileManager->read();

        foreach($persons as $person){

            if($person["id"]==$id){

                $birth=new DateTime($person["birthday"]);

                $today=new DateTime();

                $age=$today->diff($birth)->y;

                $this->response([

                    "id"=>$person["id"],
                    "name"=>$person["name"],
                    "age"=>$age

                ]);

            }

        }

        $this->response([
            "message"=>"Person not found"
        ],404);

    }

}