import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {environment} from '../../environments/environment';
import {isPlatformServer} from "@angular/common";

class EventActionDetails {
  public eventName: string;
  public category: string;
  public action: string;
  public label: {
    allowNull: boolean,
    value: string
  };
  public value: {
    allowNull: boolean,
    value: number
  };
  public step: {
    allowNull: boolean,
    value: number
  };

  constructor(obj) {
    if (obj.eventName === undefined)
      throw new Error('EventName in constructor for EventActionDetails cannot be undefined');
    if (obj.category === undefined)
      throw new Error('Category in constructor for EventActionDetails cannot be undefined');
    if (obj.action === undefined)
      throw new Error('Action in constructor for EventActionDetails cannot be undefined');
    if (obj.label === undefined || obj.label.allowNull === undefined)
      throw new Error('Label / label.allowNull in constructor for EventActionDetails cannot be undefined');
    if (obj.value === undefined || obj.value.allowNull === undefined)
      throw new Error('Value / value.allowNull in constructor for EventActionDetails cannot be undefined');
    if (obj.step === undefined || obj.step.allowNull === undefined)
      throw new Error('Step / step.allowNull in constructor for EventActionDetails cannot be undefined');

    this.eventName = obj.eventName;
    this.category = obj.category;
    this.action = obj.action;
    this.label = obj.label;
    this.value = obj.value;
    this.step = obj.step;
  }

  public clone() {
    return new EventActionDetails(JSON.parse(JSON.stringify(this)));
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  public eventAction: {
    static: {
      externalLinkClicked: EventActionDetails,
      helpBoxClicked: EventActionDetails
    },
    becomeAPro: {
      started: EventActionDetails,
      fieldUpdated: EventActionDetails,
      completed: EventActionDetails
    },
    becomeAnAgent: {
      started: EventActionDetails,
      fieldUpdated: EventActionDetails,
      completed: EventActionDetails
    },
    project: {
      edit: EventActionDetails,
      saved: EventActionDetails,
      started: EventActionDetails,
      continued: EventActionDetails,
      stepViewed: EventActionDetails,
      viewed: EventActionDetails,
      updated: EventActionDetails,
      steppedBackward: EventActionDetails,
      stepCompleted: EventActionDetails,
      completed: EventActionDetails,
      generalFeedback: {
        started: EventActionDetails,
        updated: EventActionDetails,
        completed: EventActionDetails
      },
      schedule: {
        started: EventActionDetails,
        updated: EventActionDetails,
        completed: EventActionDetails
      },
      contractorFeedback: {
        started: EventActionDetails,
        updated: EventActionDetails,
        completed: EventActionDetails
      },
      customerAbandonedProjectFeedback: {
        started: EventActionDetails,
        updated: EventActionDetails,
        completed: EventActionDetails
      },
      customerFeedback: {
        started: EventActionDetails,
        updated: EventActionDetails,
        completed: EventActionDetails
      },
    },
    checkout: {
      started: EventActionDetails,
      stepViewed: EventActionDetails,
      stepCompleted: EventActionDetails,
      completed: EventActionDetails
    },
    user: {
      customer: {
        info: {
          started: EventActionDetails,
          updated: EventActionDetails,
          completedContactInfo: EventActionDetails,
          closed: EventActionDetails
        }
      },
      contractor: {
        proposal: {
          accepted: EventActionDetails,
          declined: EventActionDetails
        }
      }
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.eventAction = {
      static: {
        externalLinkClicked: new EventActionDetails({
          eventName: 'External Link Clicked',
          category: 'static',
          action: 'external_link_clicked',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        helpBoxClicked: new EventActionDetails({
          eventName: 'Help Box Clicked',
          category: 'static',
          action: 'help_box_clicked',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: false,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        })
      },
      becomeAPro: {
        started: new EventActionDetails({
          eventName: 'Become A Pro Started',
          category: 'become_a_pro',
          action: 'started',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        fieldUpdated: new EventActionDetails({
          eventName: 'Become A Pro Field Updated',
          category: 'become_a_pro',
          action: 'field_updated',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        completed: new EventActionDetails({
          eventName: 'Become A Pro Completed',
          category: 'become_a_pro',
          action: 'completed',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        })
      },
      becomeAnAgent: {
        started: new EventActionDetails({
          eventName: 'Become An Agent Started',
          category: 'become_an_agent',
          action: 'started',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        fieldUpdated: new EventActionDetails({
          eventName: 'Become An Agent Field Updated',
          category: 'become_an_agent',
          action: 'field_updated',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        completed: new EventActionDetails({
          eventName: 'Become An Agent Completed',
          category: 'become_an_agent',
          action: 'completed',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        })
      },
      project: {
        edit: new EventActionDetails({
          eventName: 'Project Edit Item',
          category: 'project',
          action: 'edit_item',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        saved: new EventActionDetails({
          eventName: 'Project Saved Progress',
          category: 'project',
          action: 'saved_progress',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        started: new EventActionDetails({
          eventName: 'Project Started',
          category: 'project',
          action: 'started',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        continued: new EventActionDetails({
          eventName: 'Project Continued',
          category: 'project',
          action: 'continued',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        viewed: new EventActionDetails({
          eventName: 'Project Viewed',
          category: 'project',
          action: 'viewed',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        stepViewed: new EventActionDetails({
          eventName: 'Project Step Viewed',
          category: 'project',
          action: 'step_viewed',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        updated: new EventActionDetails({
          eventName: 'Project Updated',
          category: 'project',
          action: 'updated',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        steppedBackward: new EventActionDetails({
          eventName: 'Project Stepped Backward',
          category: 'project',
          action: 'stepped_backward',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        stepCompleted: new EventActionDetails({
          eventName: 'Project Step Completed',
          category: 'project',
          action: 'step_completed',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        completed: new EventActionDetails({
          eventName: 'Project Completed',
          category: 'project',
          action: 'completed',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: true,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        generalFeedback: {
          started: new EventActionDetails({
            eventName: 'Project General Feedback Started',
            category: 'project_general_feedback',
            action: 'started',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          updated: new EventActionDetails({
            eventName: 'Project General Feedback Started',
            category: 'project_general_feedback',
            action: 'updated',
            label: {
              allowNull: false,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          completed: new EventActionDetails({
            eventName: 'Project General Feedback Completed',
            category: 'project_general_feedback',
            action: 'completed',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          })
        },
        schedule: {
          started: new EventActionDetails({
            eventName: 'Project Schedule Started',
            category: 'project_schedule',
            action: 'started',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          updated: new EventActionDetails({
            eventName: 'Project Schedule Updated',
            category: 'project_schedule',
            action: 'updated',
            label: {
              allowNull: false,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          completed: new EventActionDetails({
            eventName: 'Project Schedule Completed',
            category: 'project_schedule',
            action: 'completed',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          })
        },
        contractorFeedback: {
          started: new EventActionDetails({
            eventName: 'Contractor Feedback Started',
            category: 'contractor_feedback',
            action: 'started',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          updated: new EventActionDetails({
            eventName: 'Contractor Feedback Updated',
            category: 'contractor_feedback',
            action: 'updated',
            label: {
              allowNull: false,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          completed: new EventActionDetails({
            eventName: 'Contractor Feedback Completed',
            category: 'contractor_feedback',
            action: 'completed',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          })
        },
        customerAbandonedProjectFeedback: {
          started: new EventActionDetails({
            eventName: 'Customer Abandoned Project Feedback Started',
            category: 'customer_abandoned_project_feedback',
            action: 'started',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          updated: new EventActionDetails({
            eventName: 'Customer Abandoned Project Feedback Started',
            category: 'customer_abandoned_project_feedback',
            action: 'updated',
            label: {
              allowNull: false,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          completed: new EventActionDetails({
            eventName: 'Customer Abandoned Project Feedback Completed',
            category: 'customer_abandoned_project_feedback',
            action: 'completed',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          })
        },
        customerFeedback: {
          started: new EventActionDetails({
            eventName: 'Customer Feedback Started',
            category: 'customer_feedback',
            action: 'started',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          updated: new EventActionDetails({
            eventName: 'Customer Feedback Started',
            category: 'customer_feedback',
            action: 'updated',
            label: {
              allowNull: false,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          }),
          completed: new EventActionDetails({
            eventName: 'Customer Feedback Completed',
            category: 'customer_feedback',
            action: 'completed',
            label: {
              allowNull: true,
              value: 'undefined'
            },
            value: {
              allowNull: true,
              value: 1
            },
            step: {
              allowNull: true,
              value: undefined
            }
          })
        },
      },
      checkout: {
        started: new EventActionDetails({
          eventName: 'Checkout Started',
          category: 'checkout',
          action: 'started',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: false,
            value: 1
          },
          step: {
            allowNull: true,
            value: undefined
          }
        }),
        stepViewed: new EventActionDetails({
          eventName: 'Checkout Step Viewed',
          category: 'checkout',
          action: 'step_viewed',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: false,
            value: 1
          },
          step: {
            allowNull: false,
            value: undefined
          }
        }),
        stepCompleted: new EventActionDetails({
          eventName: 'Checkout Step Completed',
          category: 'checkout',
          action: 'step_completed',
          label: {
            allowNull: false,
            value: 'undefined'
          },
          value: {
            allowNull: false,
            value: 1
          },
          step: {
            allowNull: false,
            value: undefined
          }
        }),
        completed: new EventActionDetails({
          eventName: 'Checkout Completed',
          category: 'checkout',
          action: 'completed',
          label: {
            allowNull: true,
            value: 'undefined'
          },
          value: {
            allowNull: false,
            value: 1
          },
          step: {
            allowNull: false,
            value: undefined
          }
        })
      },
      user: {
        customer: {
          info: {
            started: new EventActionDetails({
              eventName: 'Customer Info Started',
              category: 'customer_info',
              action: 'started',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            }),
            updated: new EventActionDetails({
              eventName: 'Customer Info Updated',
              category: 'customer_info',
              action: 'updated',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            }),
            completedContactInfo: new EventActionDetails({
              eventName: 'Customer Info Completed Contact Info',
              category: 'customer_info',
              action: 'completed_contact_info',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            }),
            closed: new EventActionDetails({
              eventName: 'Customer Info Closed',
              category: 'customer_info',
              action: 'closed',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            })
          }
        },
        contractor: {
          proposal: {
            accepted: new EventActionDetails({
              eventName: 'Contractor Proposal Accepted',
              category: 'contractor_proposal',
              action: 'accepted',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            }),
            declined: new EventActionDetails({
              eventName: 'Contractor Proposal Declined',
              category: 'contractor_proposal',
              action: 'declined',
              label: {
                allowNull: true,
                value: 'undefined'
              },
              value: {
                allowNull: true,
                value: 1
              },
              step: {
                allowNull: true,
                value: undefined
              }
            })
          }
        }
      }
    };
  }

  public pageView(path: string, name: string, title: string): void {
    if (!environment.production || isPlatformServer(this.platformId)) {
      return;
    }

    const segmentAnalytics = (<any>window).analytics;
    path = path.split(/[?#]/)[0];

    segmentAnalytics.page({
      type: 'page',
      path: path,
      name: name,
      title: title
    });
  }

  public pageAction(eventAction: EventActionDetails) {
    if (!environment.production || isPlatformServer(this.platformId)) {
      return;
    }

    if (!eventAction.value.allowNull && eventAction.value.value === undefined)
      throw new Error(`Event Action [${eventAction.eventName}] expected a number for value.value, but found [${eventAction.value.value}]`);
    if (!eventAction.label.allowNull && !eventAction.label.value)
      throw new Error(`Event Action [${eventAction.eventName}] expected a string for label.value, but found [${eventAction.label.value}]`);
    if (!eventAction.step.allowNull && eventAction.step.value === undefined)
      throw new Error(`Event Action [${eventAction.eventName}] expected a number for step.value, but found [${eventAction.step.value}]`);

    const segmentAnalytics = (<any>window).analytics;
    segmentAnalytics.track(eventAction.eventName, {
      category: eventAction.category,
      action: eventAction.action,
      label: eventAction.label.value,
      value: eventAction.value.value,
      step: eventAction.step.value
    });
  }

  public trackConversion(value: number, projectId: string) {
    if (!environment.production || isPlatformServer(this.platformId)) {
      return;
    }

    const segmentAnalytics = (<any>window).analytics;
    segmentAnalytics.track('Order Completed', {
      properties: {
        currency: 'USD',
        value: value,
        revenue: value,
        order_id: projectId
      }
    });
  }
}
