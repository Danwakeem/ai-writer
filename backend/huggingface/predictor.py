import sagemaker
from sagemaker.huggingface.model import HuggingFaceModel, HuggingFacePredictor

def create_predictor(predictor_name, hub):
  role = sagemaker.get_execution_role()
  # create Hugging Face Model Class
  huggingface_model = HuggingFaceModel(
    transformers_version='4.17.0',
    pytorch_version='1.10.2',
    py_version='py38',
    env=hub,
    role=role, 
  )

  huggingface_model

  # deploy model to SageMaker Inference
  predictor = huggingface_model.deploy(
    endpoint_name=predictor_name, # endpoint name
    initial_instance_count=1, # number of instances
    instance_type='ml.m5.xlarge' # ec2 instance type
  )
  return predictor

def get_predictor(endpoint_name):
  return HuggingFacePredictor(
    endpoint_name=endpoint_name,
  )

def delete_predictor(predictor):
    predictor.delete_model()
    predictor.delete_endpoint()

def create(event, context):
  try:
    create_predictor(event["predictorName"], event["hub"])
    return event
  except:
    return event

def predict(event, context):
  predictor_name = event["predictorName"]
  predictor = get_predictor(predictor_name)
  input = event['input']
  response = predictor.predict({
    'inputs': input
  })
  return response

def remove(event, context):
  predictor_name = event["predictorName"]
  predictor = get_predictor(predictor_name)
  delete_predictor(predictor)