New questionnaire
=================

If a new Questionnaire is selected, a [QuestionnaireResponse](https://github.com/ahdis/matchbox-formfiller/blob/master/src/examples/radorder-qr-default.json) for a default prefilling will be searched.

Parameters for the search are the canonical URL of the Questionnaire and this identifier:

system = http://ahdis.ch/fhir/Questionnaire   
value  = DEFAULT

The displayed Questionnaire will be prefilled with the default values.   
For the PoC, the following values are applied for the hidden fields:
* order.placerOrderIdentifierDomainn = http://example.org/poc-orderer
* patient.localPidDomain = http://example.org/poc-patient

Questionnaire with adaptions from ballot version
================================================

https://github.com/ahdis/matchbox-formfiller/blob/master/src/examples/radorder.json




