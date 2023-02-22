import sagemaker
from sagemaker.huggingface.model import HuggingFaceModel, HuggingFacePredictor

def create_predictor():
  # Hub Model configuration. <https://huggingface.co/models>
  hub = {
    'HF_MODEL_ID':'snrspeaks/t5-one-line-summary',
    'HF_TASK':'text2text-generation'
  }

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
  predictor = create_predictor()
  event["predictorName"] = predictor.endpoint_name
  return event

def get_headline(event, context):
  predictor = get_predictor(event["predictorName"])
  input = event['input']
  response = predictor.predict({
    'inputs': input
  })
  return response

def remove(event, context):
  predictor = get_predictor(event["predictorName"])
  delete_predictor(predictor)