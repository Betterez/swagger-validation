const {expect} = require('chai');
const {validateRequest} = require('../index');
const {expectValidationPassed, expectValidationFailed} = require('./test_helper');
const {ValidationLogs} = require('../lib/validation/validationLogs');

describe('validateRequest', () => {
  let requestSchema;
  let req;
  let models;
  let validationSettings;

  beforeEach(() => {
    requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'body',
          schema: {
            $ref: 'RequestBody',
          },
          required: true
        }
      ],
    };
    models = {
      RequestBody: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          }
        }
      }
    };
    req = {
      body: {}
    };
    validationSettings = {};
  });

  describe('validation errors', () => {
    it('should include the path of the data which failed validation in the result', () => {
      req.body = {id: 1};
      let result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ['id is not a type of string']);
      expect(result.errors[0].context.toLiteral()).to.have.property('dataPath');
      expect(result.errors[0].context.toLiteral().dataPath).to.eql(['id']);
      expect(result.errors[0].context.formatDataPath()).to.eql("id");

      models = {
        RequestBody: {
          type: 'object',
          properties: {
            someNestedObject: {
              $ref: 'ObjectWithArray'
            }
          }
        },
        ObjectWithArray: {
          type: 'object',
          properties: {
            someArray: {
              $ref: 'ArrayOfStrings'
            }
          }
        },
        ArrayOfStrings: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      };

      req.body = {someNestedObject: {someArray: [1]}};
      result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ['1 is not a type of string']);
      expect(result.errors[0].context.toLiteral()).to.have.property('dataPath');
      expect(result.errors[0].context.toLiteral().dataPath).to.eql(['someNestedObject', 'someArray', 0]);
      expect(result.errors[0].context.formatDataPath()).to.eql("someNestedObject.someArray[0]");
    });

    it('should include the path of the model which failed validation in the result', () => {
      req.body = {id: 1};
      let result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ['id is not a type of string']);
      expect(result.errors[0].context.toLiteral()).to.have.property('modelPath');
      expect(result.errors[0].context.toLiteral().modelPath).to.eql(['RequestBody']);
      expect(result.errors[0].context.formatModelPath()).to.eql("RequestBody");

      models = {
        RequestBody: {
          type: 'object',
          properties: {
            someNestedObject: {
              $ref: 'ObjectWithArray'
            }
          }
        },
        ObjectWithArray: {
          type: 'object',
          properties: {
            someArray: {
              $ref: 'ArrayOfStrings'
            }
          }
        },
        ArrayOfStrings: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      };

      req.body = {someNestedObject: {someArray: [1]}};
      result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ['1 is not a type of string']);
      expect(result.errors[0].context.toLiteral()).to.have.property('modelPath');
      expect(result.errors[0].context.toLiteral().modelPath).to.eql(['RequestBody', 'ObjectWithArray', 'ArrayOfStrings']);
      expect(result.errors[0].context.formatModelPath()).to.eql("RequestBody → ObjectWithArray → ArrayOfStrings");
    });
  });

  describe('null value handling', () => {
    it('should allow null values by default (legacy behaviour)', () => {
      req.body = {id: null};
      const result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    it('should allow null values by default for a property which is specified with a $ref (legacy behaviour)', () => {
      models = {
        RequestBody: {
          type: 'object',
          properties: {
            id: {
              $ref: 'IdProperty'
            }
          }
        },
        IdProperty: {
          type: 'string'
        }
      };

      req.body = {id: null};
      const result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    it('should not allow a value to be null when "nullable" is false', () => {
      models.RequestBody.properties.id.nullable = false;
      req.body = {id: null};
      const result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ["id cannot be null"]);
    });

    it('should not allow a value to be null when a property is specified with a $ref, and the referenced model has "nullable" set to false', () => {
      models = {
        RequestBody: {
          type: 'object',
          properties: {
            id: {
              $ref: 'IdProperty'
            }
          }
        },
        IdProperty: {
          type: 'string',
          nullable: false
        }
      };

      req.body = {id: null};
      const result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ["id cannot be null"]);
    });

    describe('when the validation options specify that properties are not nullable by default', () => {
      it('should not allow a property to be null by default', () => {
        req.body = {id: null};
        const result = validateRequest(requestSchema, req, models, {allPropertiesAreNullableByDefault: false});
        expectValidationFailed(result, ["id cannot be null"]);
      });

      it('should not allow a property to be null by default when the property is specified with a $ref', () => {
        models = {
          RequestBody: {
            type: 'object',
            properties: {
              id: {
                $ref: 'IdProperty'
              }
            }
          },
          IdProperty: {
            type: 'string'
          }
        };

        req.body = {id: null};
        const result = validateRequest(requestSchema, req, models, {allPropertiesAreNullableByDefault: false});
        expectValidationFailed(result, ["id cannot be null"]);
      });
    });

    describe('when the validation options specify that null values should be removed from objects', () => {
      let validationSettings;

      beforeEach(() => {
        validationSettings = {
          replaceValues: true,
          removeNullValuesFromObjects: true
        };
      });

      it('should remove all properties from an object whose value is "null"', () => {
        req.body = {id: null, someOtherProperty: null};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({});
      });

      it('should not remove a property from an object when the property value is "null" and the value is explicitly marked as nullable in the schema', () => {
        models.RequestBody.properties.id.nullable = true;
        req.body = {id: null, someOtherProperty: null};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({id: null});
      });

      it('should remove all properties from an object whose value is "null" when the object schema does not have any properties', () => {
        delete models.RequestBody.properties;
        req.body = {id: null, someOtherProperty: null};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({});
      });

      it('should remove all properties from an object whose value is "null" when the "allPropertiesAreNullableByDefault" validation option is enabled', () => {
        validationSettings.allPropertiesAreNullableByDefault = true;

        req.body = {id: null, someOtherProperty: null};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({});
      });

      it('should not remove a null property from an object and instead return a validation error when the "allPropertiesAreNullableByDefault" validation option is disabled', () => {
        validationSettings.allPropertiesAreNullableByDefault = false;

        req.body = {id: null};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationFailed(result, ["id cannot be null"]);
        expect(req.body).to.eql({id: null});
      });

      it('should return information about which properties were removed', () => {
        req.body = {id: null, someOtherProperty: null};

        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(result.logs).to.be.an.instanceof(ValidationLogs);
        expect(result.logs.formatNullValuesRemovedFromObjects()).to.eql('id, someOtherProperty');
      });

      it('should throw an error if the "removeNullValuesFromObjects" validation setting is enabled, but the "replaceValues" setting is not', () => {
        const validationSettings = {removeNullValuesFromObjects: true, replaceValues: false};
        req.body = {id: '1'};
        expect(() => validateRequest(requestSchema, req, models, validationSettings))
          .to.throw('Incompatible validation settings.  When using the "removeNullValuesFromObjects" setting, you must also enable the "replaceValues" setting because the "removeNullValuesFromObjects" setting will delete object properties.');
      });
    });

    describe('when the validation options specify that null values should be removed from arrays', () => {
      let validationSettings;

      beforeEach(() => {
        models.RequestBody = {
          type: 'object',
          properties: {
            ids: {
              type: 'array',
              items: {
                type: 'integer'
              }
            }
          }
        };

        validationSettings = {
          replaceValues: true,
          removeNullValuesFromArrays: true
        };
      });

      it('should remove all array items whose value is "null"', () => {
        req.body = {ids: [null, 1, 2, null, 3, null]};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({ids: [1, 2, 3]});
      });

      it('should not remove array items that are "null" when the array items are explicitly marked as nullable in the schema', () => {
        models.RequestBody.properties.ids.items.nullable = true;
        req.body = {ids: [null, 1, 2, null, 3, null]};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({ids: [null, 1, 2, null, 3, null]});
      });

      it('should remove all array items that are "null" when the "allPropertiesAreNullableByDefault" validation option is enabled', () => {
        validationSettings.allPropertiesAreNullableByDefault = true;

        req.body = {ids: [null, 1, 2, null, 3, null]};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({ids: [1, 2, 3]});
      });

      it('should not remove array items that are "null" and instead return a validation error when the "allPropertiesAreNullableByDefault" validation option is disabled', () => {
        validationSettings.allPropertiesAreNullableByDefault = false;

        req.body = {ids: [null, 1, 2, null, 3, null]};
        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationFailed(result, ["integer cannot be null", "integer cannot be null", "integer cannot be null"]);
        expect(req.body).to.eql({ids: [null, 1, 2, null, 3, null]});
      });

      it('should return information about which array items were removed', () => {
        req.body = {ids: [null, 1, 2, null, 3, null]};

        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(result.logs).to.be.an.instanceof(ValidationLogs);
        expect(result.logs.formatNullValuesRemovedFromArrays()).to.eql('ids[0], ids[3], ids[5]');
      });

      it('should throw an error if the "removeNullValuesFromArrays" validation setting is enabled, but the "replaceValues" setting is not', () => {
        const validationSettings = {removeNullValuesFromArrays: true, replaceValues: false};
        req.body = {id: '1'};
        expect(() => validateRequest(requestSchema, req, models, validationSettings))
          .to.throw('Incompatible validation settings.  When using the "removeNullValuesFromArrays" setting, you must also enable the "replaceValues" setting because the "removeNullValuesFromArrays" setting will modify the contents of arrays.');
      });
    });
  });

  describe('empty string handling', () => {
    it('should not allow a required string parameter to be an empty string (legacy behaviour)', () => {
      models.RequestBody.required = ['id'];
      req.body = {id: ''};
      const result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ["id is required"]);
    });

    describe('when the validation settings specify that empty strings are not treated the same as undefined values', () => {
      it('should allow a required string parameter to be an empty string', () => {
        models.RequestBody.required = ['id'];
        req.body = {id: ''};
        const result = validateRequest(requestSchema, req, models, {treatEmptyStringsLikeUndefinedValues: false});
        expectValidationPassed(result);
      });
    });
  });

  describe('additional properties handling', () => {
    it('should allow an object to have additional properties which are not specified in the schema (legacy behaviour)', () => {
      req.body = {id: '1', someExtraProperty: 'some value'}
      const result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    describe('when the validation settings specify that objects are not allowed to have additional properties by default', () => {
      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        req.body = {id: '1', someExtraProperty: 'some value'}
        const result = validateRequest(requestSchema, req, models, {objectsCanHaveAnyAdditionalPropertiesByDefault: false});
        expectValidationFailed(result, ['object contains invalid properties: someExtraProperty']);
      });
    });

    describe('when the validation settings specify that unrecognized properties in objects should be removed', () => {
      it('should remove any unrecognized properties which are not specified in the schema', () => {
        const validationSettings = {removeUnrecognizedPropertiesFromObjects: true, replaceValues: true};
        req.body = {id: '1', someExtraProperty: 'some value', anotherExtraProperty: 'another value'};

        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({id: '1'});
      });

      it('should return information about which properties were removed', () => {
        const validationSettings = {removeUnrecognizedPropertiesFromObjects: true, replaceValues: true};
        req.body = {id: '1', someExtraProperty: 'some value', anotherExtraProperty: 'another value'};

        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(result.logs).to.be.an.instanceof(ValidationLogs);
        expect(result.logs.formatDeletedProperties()).to.eql('someExtraProperty, anotherExtraProperty');
      });

      it('should not remove any unrecognized properties from an object when the schema specifies "additionalProperties: true"', () => {
        models.RequestBody.additionalProperties = true;

        const validationSettings = {removeUnrecognizedPropertiesFromObjects: true, replaceValues: true};
        req.body = {id: '1', someExtraProperty: 'some value', anotherExtraProperty: 'another value'};

        const result = validateRequest(requestSchema, req, models, validationSettings);
        expectValidationPassed(result);
        expect(req.body).to.eql({id: '1', someExtraProperty: 'some value', anotherExtraProperty: 'another value'});
      });

      it('should throw an error if the "removeUnrecognizedPropertiesFromObjects" validation setting is enabled, but the "replaceValues" setting is not', () => {
        const validationSettings = {removeUnrecognizedPropertiesFromObjects: true, replaceValues: false};
        req.body = {id: '1'};
        expect(() => validateRequest(requestSchema, req, models, validationSettings))
          .to.throw('Incompatible validation settings.  When using the "removeUnrecognizedPropertiesFromObjects" setting, you must also enable the "replaceValues" setting because the "removeUnrecognizedPropertiesFromObjects" setting will replace values in objects (it will delete object properties).');
      });

      it('should throw an error if both the "removeUnrecognizedPropertiesFromObjects" validation setting is enabled, and the "objectsCanHaveAnyAdditionalPropertiesByDefault" validation settings is disabled', () => {
        const validationSettings = {removeUnrecognizedPropertiesFromObjects: true, objectsCanHaveAnyAdditionalPropertiesByDefault: false};
        req.body = {id: '1'};
        expect(() => validateRequest(requestSchema, req, models, validationSettings))
          .to.throw('Incompatible validation settings.  When disabling the "objectsCanHaveAnyAdditionalPropertiesByDefault" setting, you cannot enable the "removeUnrecognizedPropertiesFromObjects" setting.  Disabling the "objectsCanHaveAnyAdditionalPropertiesByDefault" setting will cause errors to be thrown when an object contains unrecognized properties.  Enabling the "removeUnrecognizedPropertiesFromObjects" setting will cause unrecognized properties to be removed from objects, thereby preventing any errors from being thrown.');
      });
    });
  });

  describe('validation of the request body', () => {
    beforeEach(() => {
      models.RequestBody.required = ['id'];
    });

    it('should allow the request body to have two contradictory schemas, one of which does not match the schema that is provided to the function (legacy behaviour)', () => {
      requestSchema.parameters[0].name = 'requestBody';

      req.body = {
        id: '1'
      };
      let result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);

      req.body = {
        requestBody: {
          id: '1'
        }
      };
      result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    describe('when the validation settings specify that the request body is not allowed to have two contradictory schemas', () => {
      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        requestSchema.parameters[0].name = 'requestBody';

        req.body = {
          id: '1'
        };
        let result = validateRequest(requestSchema, req, models, {requestBodyCanHaveTwoContradictorySchemas: false});
        expectValidationPassed(result);

        req.body = {
          requestBody: {
            id: '1'
          }
        };
        result = validateRequest(requestSchema, req, models, {requestBodyCanHaveTwoContradictorySchemas: false});
        expectValidationFailed(result, ['id is required']);
      });
    });
  });

  describe('invalid schemas', () => {
    it('should allow a schema to have an invalid "type" which points to another model, as if the "type" were a "$ref" (legacy behaviour)', () => {
      models = {
        RequestBody: {
          type: 'SomeModel'
        },
        SomeModel: {
          type: 'object',
          properties: {
            someProperty: {
              type: 'string'
            }
          }
        }
      };
      req.body = {
        someProperty: 'some value'
      };
      let result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    it('should not allow a schema to have an invalid "type"', () => {
      models = {
        RequestBody: {
          type: 'abcdefghijklmnop',
          properties: {
            someProperty: {
              type: 'string'
            }
          }
        }
      };
      req.body = {
        someProperty: 'some value'
      };
      let result = validateRequest(requestSchema, req, models);
      expectValidationFailed(result, ['Unknown param type abcdefghijklmnop']);
    });

    it('should allow a schema to declare both a "type" and a "$ref" which contradict each other (legacy behaviour)', () => {
      models = {
        RequestBody: {
          type: 'object',
          properties: {
            someProperty: {
              type: 'string', // This type intentionally contradicts the $ref below
              $ref: 'SomeObject'
            }
          }
        },
        SomeObject: {
          type: 'object',
          properties: {
            someOtherProperty: {
              type: 'string'
            }
          }
        }
      };

      req.body = {
        someProperty: {
          someOtherProperty: 'some value'
        }
      };
      let result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    it('should allow a request parameter to declare both a "type" and a "schema" which contradict each other (legacy behaviour)', () => {
      requestSchema = {
        description: 'A mock endpoint',
        path: '/some-endpoint/{someParameter}',
        method: 'POST',
        parameters: [
          {
            in: 'path',
            name: 'someParameter',
            type: 'number',
            schema: {
              type: 'string'
            },
            required: true
          }
        ],
      };

      req.params = {
        someParameter: 'ABC'
      };
      let result = validateRequest(requestSchema, req, models);
      expectValidationPassed(result);
    });

    describe('when the validation settings specify that schemas with invalid types are not allowed', () => {
      beforeEach(() => {
        requestSchema.parameters = [
          {
            in: 'body',
            schema: {
              $ref: 'RequestBody'
            },
            required: true
          }
        ];

        models = {
          RequestBody: {
            type: 'SomeModel'
          },
          SomeModel: {
            type: 'object',
            properties: {
              someProperty: {
                type: 'string'
              }
            }
          }
        };
        req.body = {
          someProperty: 'some value'
        };
      });

      it('should return an error when a schema has a "type" which is not one of the types recognized in the OpenAPI spec', () => {
        let result = validateRequest(requestSchema, req, models, {allowSchemasWithInvalidTypesAndTreatThemLikeRefs: false});
        expectValidationFailed(result, ['Swagger schema is invalid: RequestBody has bad type "SomeModel".  Allowed types are: array, boolean, file, integer, number, string, object']);
      });

      describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
        it('should throw an error when a schema has a "type" which is not one of the types recognized in the OpenAPI spec', () => {
          expect(() => validateRequest(requestSchema, req, models, {
            allowSchemasWithInvalidTypesAndTreatThemLikeRefs: false,
            throwErrorsWhenSchemaIsInvalid: true
          }))
            .to.throw('Swagger schema is invalid: RequestBody has bad type "SomeModel".  Allowed types are: array, boolean, file, integer, number, string, object');
        });
      });
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      it('should throw an error when a schema has an invalid "type"', () => {
        models = {
          RequestBody: {
            type: 'abcdefghijklmnop',
            properties: {
              someProperty: {
                type: 'string'
              }
            }
          }
        };
        req.body = {
          someProperty: 'some value'
        };
        expect(() => validateRequest(requestSchema, req, models, {
          allowSchemasWithInvalidTypesAndTreatThemLikeObjects: false,
          throwErrorsWhenSchemaIsInvalid: true
        }))
          .to.throw('Swagger schema is invalid: RequestBody contains unknown reference to model "abcdefghijklmnop"');
      });

      it('should throw an error when a schema has both a "type" and a "$ref"', () => {
        models = {
          RequestBody: {
            type: 'object',
            properties: {
              someProperty: {
                type: 'string', // This type intentionally contradicts the $ref below
                $ref: 'SomeObject'
              }
            }
          },
          SomeObject: {
            type: 'object',
            properties: {
              someOtherProperty: {
                type: 'string'
              }
            }
          }
        };

        req.body = {
          someProperty: {
            someOtherProperty: 'some value'
          }
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: A schema can have either a "type" or a "$ref", but not both.');
      });

      it('should throw an error when a schema has a "$ref" that references a model which was not provided in the "models" argument', () => {
        models = {
          RequestBody: {
            type: 'object',
            properties: {
              someProperty: {
                $ref: 'SomeModelWhichDoesNotExist'
              }
            }
          },
        };

        req.body = {
          someProperty: {
            someOtherProperty: 'some value'
          }
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: RequestBody contains unknown reference to model "SomeModelWhichDoesNotExist"');
      });

      it('should throw an error when a request parameter declares both a "type" and a "schema"', () => {
        requestSchema = {
          description: 'A mock endpoint',
          path: '/some-endpoint/{someParameter}',
          method: 'POST',
          parameters: [
            {
              in: 'path',
              name: 'someParameter',
              type: 'number',
              schema: {
                type: 'string'
              },
              required: true
            }
          ],
        };

        req.params = {
          someParameter: 'ABC'
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: request parameter "someParameter" can have either a "type" or a "schema", but not both.');
      });
    });
  });

  describe('when the validation settings specify that errors should have improved messages', () => {
    let validationSettings;

    beforeEach(() => {
      validationSettings = {
        allPropertiesAreNullableByDefault: false,
        treatEmptyStringsLikeUndefinedValues: false,
        objectsCanHaveAnyAdditionalPropertiesByDefault: false,
        requestBodyCanHaveTwoContradictorySchemas: false,
        throwErrorsWhenSchemaIsInvalid: true,
        allowStringRepresentationsOfBooleans: false,
        strictDateParsing: true,
        allowNumbersToBeStrings: false,
        allowNumberFormatsWithNoEquivalentRepresentationInJavascript: false,
        allowSchemasWithInvalidTypesAndTreatThemLikeRefs: false,
        improvedErrorMessages: true,
      };

      models = {
        RequestBody: {
          type: 'object',
          required: ['requiredBoolean', 'requiredFile'],
          properties: {
            boolean: {
              type: 'boolean'
            },
            requiredBoolean: {
              type: 'boolean'
            },
            string: {
              type: 'string'
            },
            stringWithEnum: {
              type: 'string',
              enum: ['Value A', 'Value B']
            },
            stringWithPattern: {
              type: 'string',
              pattern: '^\\w*$'
            },
            stringWithAtLeastOneCharacter: {
              type: 'string',
              minLength: 1,
            },
            stringWithAtMostOneCharacter: {
              type: 'string',
              maxLength: 1,
            },
            arrayOfStrings: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            arrayWithUniqueItems: {
              type: 'array',
              uniqueItems: true,
              items: {
                type: 'string'
              }
            },
            arrayWithAtLeastOneItem: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string'
              }
            },
            arrayWithAtMostOneItem: {
              type: 'array',
              maxItems: 1,
              items: {
                type: 'string'
              }
            },
            date: {
              type: 'string',
              format: 'date',
            },
            dateWithCustomPattern: {
              type: 'string',
              format: 'date',
              pattern: '/d{4}-/d{2}-/d{2}'
            },
            dateTime: {
              type: 'string',
              format: 'date-time',
            },
            dateTimeWithCustomPattern: {
              type: 'string',
              format: 'date-time',
              pattern: '/d{4}-/d{2}-/d{2}'
            },
            requiredFile: {
              type: 'file'
            },
            integer: {
              type: 'integer'
            },
            integerAboveZero: {
              type: 'integer',
              minimum: 1
            },
            integerBelowZero: {
              type: 'integer',
              maximum: -1
            },
            number: {
              type: 'number'
            },
            numberEqualToOrAboveZero: {
              type: 'number',
              minimum: 0
            },
            numberEqualToOrBelowZero: {
              type: 'number',
              maximum: 0
            },
            object: {
              type: 'object',
              required: ['someProperty'],
              properties: {
                someProperty: {
                  type: 'string'
                }
              }
            },
            deepProperty: {
              type: 'object',
              properties: {
                deepArray: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      anotherProperty: {
                        type: 'boolean'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
    });

    function performValidation(value) {
      const defaultRequestBody = {
        requiredBoolean: true,
        requiredFile: 'ABC',
      };

      req.body = {...defaultRequestBody, ...value};
      return validateRequest(requestSchema, req, models, validationSettings);
    }

    function expectValueToCauseError(value, expectedErrorMessage) {
      const result = performValidation(value);
      expectValidationFailed(result, [expectedErrorMessage]);
    }

    function expectValueToThrowError(value, expectedErrorMessage) {
      expect(() => performValidation(value)).to.throw(expectedErrorMessage);
    }

    it('should return errors with the expected error message under a variety of circumstances', () => {
      // boolean validation
      expectValueToCauseError({boolean: null}, 'Request body is invalid: boolean cannot be null');
      expectValueToCauseError({boolean: 'true'}, 'Request body is invalid: expected boolean to be a boolean, but it is a string');
      expectValueToCauseError({boolean: 1}, 'Request body is invalid: expected boolean to be a boolean, but it is a number');
      expectValueToCauseError({boolean: {}}, 'Request body is invalid: expected boolean to be a boolean, but it is an object');
      expectValueToCauseError({boolean: []}, 'Request body is invalid: expected boolean to be a boolean, but it is an array');
      expectValueToCauseError({requiredBoolean: undefined}, 'Request body is invalid: requiredBoolean is required but is missing');

      // string validation
      expectValueToCauseError({string: null}, 'Request body is invalid: string cannot be null');
      expectValueToCauseError({string: 1}, 'Request body is invalid: expected string to be a string, but it is a number');
      expectValueToCauseError({stringWithEnum: 'Value C'}, 'Request body is invalid: stringWithEnum only allows a specific set of values, and "Value C" is not one of the allowed values');
      expectValueToCauseError({stringWithPattern: 'Item A'}, 'Request body is invalid: expected stringWithPattern to match the regular expression /^\\w*$/');
      expectValueToCauseError({stringWithAtLeastOneCharacter: ''}, 'Request body is invalid: expected stringWithAtLeastOneCharacter to be at least 1 character long, but it has a length of 0');
      expectValueToCauseError({stringWithAtMostOneCharacter: 'AB'}, 'Request body is invalid: expected stringWithAtMostOneCharacter to be at most 1 character long, but it has a length of 2');

      // date validation
      expectValueToCauseError({date: '2'}, 'Request body is invalid: expected date to be a date in ISO 8601 format');
      expectValueToCauseError({dateWithCustomPattern: '2'}, 'Request body is invalid: expected dateWithCustomPattern to be a date matching the pattern /d{4}-/d{2}-/d{2}');

      // date-time validation
      expectValueToCauseError({dateTime: '2'}, 'Request body is invalid: expected dateTime to be a date in ISO 8601 format');
      expectValueToCauseError({dateTimeWithCustomPattern: '2'}, 'Request body is invalid: expected dateTimeWithCustomPattern to be a date matching the pattern /d{4}-/d{2}-/d{2}');

      // file validation
      expectValueToCauseError({requiredFile: null}, 'Request body is invalid: requiredFile cannot be null');

      // integer validation
      expectValueToCauseError({integer: null}, 'Request body is invalid: integer cannot be null');
      expectValueToCauseError({integer: '1'}, 'Request body is invalid: expected integer to be a number, but it is a string');
      expectValueToCauseError({integer: 1.1}, 'Request body is invalid: expected integer to be an integer, but it is a floating-point number');
      expectValueToCauseError({integerAboveZero: 0}, 'Request body is invalid: expected integerAboveZero to have a value of 1 or greater, but it has a value of 0');
      expectValueToCauseError({integerBelowZero: 0}, 'Request body is invalid: expected integerBelowZero to have a value of -1 or lower, but it has a value of 0');

      // number validation
      expectValueToCauseError({number: '1'}, 'Request body is invalid: expected number to be a number, but it is a string');
      expectValueToCauseError({number: NaN}, 'Request body is invalid: expected number to be a number, but it is NaN');
      expectValueToCauseError({number: Infinity}, 'Request body is invalid: expected number to be a number, but it is Infinity');
      expectValueToCauseError({number: -Infinity}, 'Request body is invalid: expected number to be a number, but it is -Infinity');
      expectValueToCauseError({numberEqualToOrAboveZero: -0.001}, 'Request body is invalid: expected numberEqualToOrAboveZero to have a value of 0 or greater, but it has a value of -0.001');
      expectValueToCauseError({numberEqualToOrBelowZero: 0.001}, 'Request body is invalid: expected numberEqualToOrBelowZero to have a value of 0 or lower, but it has a value of 0.001');

      // array validation
      expectValueToCauseError({arrayOfStrings: null}, 'Request body is invalid: arrayOfStrings cannot be null');
      expectValueToCauseError({arrayOfStrings: ''}, 'Request body is invalid: expected arrayOfStrings to be an array, but it is a string');
      expectValueToCauseError({arrayWithUniqueItems: ''}, 'Request body is invalid: expected arrayWithUniqueItems to be an array, but it is a string');
      expectValueToCauseError({arrayWithUniqueItems: ['A', 'A', 'B', 'C', 'C', 'D']}, 'Request body is invalid: expected items in arrayWithUniqueItems to be unique, but the following items appear more than once: A, C');
      expectValueToCauseError({arrayWithAtLeastOneItem: []}, 'Request body is invalid: expected arrayWithAtLeastOneItem to have at least 1 item, but it has 0 items');
      expectValueToCauseError({arrayWithAtMostOneItem: ['A', 'B']}, 'Request body is invalid: expected arrayWithAtMostOneItem to have at most 1 item, but it has 2 items');

      // object validation
      expectValueToCauseError({object: null}, 'Request body is invalid: object cannot be null');
      expectValueToCauseError({object: []}, 'Request body is invalid: expected object to be an object, but it is an array');
      expectValueToCauseError({object: {}}, 'Request body is invalid: object.someProperty is required but is missing');
      expectValueToCauseError({object: {someProperty: 'A', unknownProperty: 'B', anotherUnknownProperty: 'C'}}, 'Request body is invalid: object contains unrecognized properties "unknownProperty", "anotherUnknownProperty"');
      expectValueToCauseError({unknownProperty: 'B'}, 'Request body is invalid: request body contains unrecognized property "unknownProperty"');

      // deeply-nested property validation
      expectValueToCauseError({deepProperty: {deepArray: [{anotherProperty: true}, {anotherProperty: 1}]}}, 'Request body is invalid: expected deepProperty.deepArray[1].anotherProperty to be a boolean, but it is a number');
    });

    it('should throw the expected error message when the schema contains a property with a bad "type"', () => {
      models.RequestBody = {
        type: 'object',
        properties: {
          propertyWithBadType: {
            type: 'someInvalidType'
          }
        }
      };

      expectValueToThrowError({propertyWithBadType: '1'}, 'Swagger schema is invalid: RequestBody has bad type "someInvalidType".  Allowed types are: array, boolean, file, integer, number, string, object');
    });

    it('should throw the expected error message when the schema contains a string property with the "date" type', () => {
      validationSettings.allowStringsToHaveUnreliableDateFormat = false;
      expectValueToThrowError({date: '2024-01-01'}, 'Swagger schema is invalid: string has "date" format, but this format is unreliable because it parses dates without considering timezones.  Use the "date-time" format instead, or define a "pattern" to validate the format of the date string, and parse it yourself.');
    });
  });
});
